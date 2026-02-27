const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const swaggerPath = path.join(ROOT, 'backend', 'swagger-output.json');
const outPath = path.join(ROOT, 'docs', 'api-reference.md');

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const toTitle = (value) =>
  String(value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const schemaToFields = (schema) => {
  if (!schema || typeof schema !== 'object') return [];

  if (schema.type === 'array' && schema.items) {
    return [{ name: '(array item)', details: schema.items.type || '$ref' }];
  }

  const props = schema.properties || {};
  const required = new Set(schema.required || []);
  const fields = [];

  for (const [name, meta] of Object.entries(props)) {
    const parts = [];
    if (required.has(name)) parts.push('required');
    if (meta?.type) parts.push(meta.type);
    if (meta?.format) parts.push(meta.format);
    if (meta?.example !== undefined) parts.push(`example: ${JSON.stringify(meta.example)}`);
    if (meta?.description) parts.push(meta.description);
    if (meta?.$ref) parts.push(`$ref: ${meta.$ref}`);
    fields.push({ name, details: parts.join(', ') || '-' });
  }

  return fields;
};

const renderFieldTable = (fields) => {
  if (!fields.length) return 'No documented body schema.';
  const lines = ['| Field | Details |', '|---|---|'];
  for (const field of fields) {
    lines.push(`| \`${field.name}\` | ${field.details.replace(/\|/g, '\\|')} |`);
  }
  return lines.join('\n');
};

const extractAuth = (operation) => {
  if (Array.isArray(operation.security) && operation.security.length === 0) {
    return 'Public';
  }
  const authParam = (operation.parameters || []).find(
    (p) => p.in === 'header' && String(p.name || '').toLowerCase() === 'authorization'
  );
  return authParam ? 'Bearer JWT' : 'Public';
};

const main = () => {
  if (!fs.existsSync(swaggerPath)) {
    throw new Error(`Swagger file not found: ${swaggerPath}`);
  }

  const swagger = readJson(swaggerPath);
  const paths = swagger.paths || {};
  const servers = swagger.servers || [];
  const tags = swagger.tags || [];

  const grouped = new Map();
  let totalEndpoints = 0;

  for (const [routePath, ops] of Object.entries(paths)) {
    for (const method of HTTP_METHODS) {
      const operation = ops?.[method];
      if (!operation) continue;
      totalEndpoints += 1;
      const tag = (operation.tags && operation.tags[0]) || 'Untagged';
      if (!grouped.has(tag)) grouped.set(tag, []);
      grouped.get(tag).push({ method: method.toUpperCase(), routePath, operation });
    }
  }

  const sortedTagNames = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
  const now = new Date().toISOString();
  const baseUrl = servers[0]?.url || 'http://localhost:5000';
  const publicEndpoints = [...grouped.values()]
    .flat()
    .filter((entry) => extractAuth(entry.operation) === 'Public').length;

  const lines = [];
  lines.push('# API Reference');
  lines.push('');
  lines.push('Generated from `backend/swagger-output.json`.');
  lines.push('');
  lines.push(`- Generated at: \`${now}\``);
  lines.push(`- Base URL: \`${baseUrl}\``);
  lines.push(`- Total endpoints: **${totalEndpoints}**`);
  lines.push(`- Public endpoints: **${publicEndpoints}**`);
  lines.push(`- Protected endpoints: **${totalEndpoints - publicEndpoints}**`);
  lines.push('');
  lines.push('## How To Use');
  lines.push('');
  lines.push('- Interactive docs: `GET /api/docs`');
  lines.push('- Raw OpenAPI JSON: `GET /api/docs.json`');
  lines.push('- Regenerate swagger spec: `npm --prefix backend run swagger:gen`');
  lines.push('- Regenerate this file: `npm run docs:api`');
  lines.push('');
  lines.push('## Security');
  lines.push('');
  lines.push('Most endpoints require `Authorization: Bearer <JWT>`.');
  lines.push('');
  lines.push('## Tags');
  lines.push('');
  lines.push('| Tag | Endpoints | Description |');
  lines.push('|---|---:|---|');

  for (const tagName of sortedTagNames) {
    const desc = tags.find((t) => t.name === tagName)?.description || '-';
    lines.push(`| ${tagName} | ${grouped.get(tagName).length} | ${desc} |`);
  }

  for (const tagName of sortedTagNames) {
    const entries = grouped
      .get(tagName)
      .slice()
      .sort((a, b) =>
        a.routePath === b.routePath
          ? a.method.localeCompare(b.method)
          : a.routePath.localeCompare(b.routePath)
      );

    lines.push('');
    lines.push(`## ${toTitle(tagName)}`);
    lines.push('');
    lines.push('| Method | Path | Auth |');
    lines.push('|---|---|---|');
    for (const entry of entries) {
      lines.push(`| \`${entry.method}\` | \`${entry.routePath}\` | ${extractAuth(entry.operation)} |`);
    }

    for (const entry of entries) {
      const { method, routePath, operation } = entry;
      const description = operation.description || operation.summary || 'No description provided.';
      const parameters = operation.parameters || [];
      const requestSchema =
        operation.requestBody?.content?.['application/json']?.schema ||
        operation.requestBody?.content?.['multipart/form-data']?.schema ||
        null;
      const bodyFields = schemaToFields(requestSchema);
      const responses = operation.responses || {};

      lines.push('');
      lines.push(`### \`${method} ${routePath}\``);
      lines.push('');
      if (operation.summary) {
        lines.push(`**Summary:** ${operation.summary}`);
        lines.push('');
      }
      lines.push(description);
      lines.push('');

      if (parameters.length) {
        lines.push('**Parameters**');
        lines.push('');
        lines.push('| Name | In | Type | Required |');
        lines.push('|---|---|---|---|');
        for (const p of parameters) {
          lines.push(
            `| \`${p.name || '-'}\` | ${p.in || '-'} | ${p.schema?.type || '-'} | ${
              p.required ? 'Yes' : 'No'
            } |`
          );
        }
        lines.push('');
      }

      if (requestSchema) {
        lines.push('**Request Body**');
        lines.push('');
        lines.push(renderFieldTable(bodyFields));
        lines.push('');
      }

      if (Object.keys(responses).length) {
        lines.push('**Responses**');
        lines.push('');
        lines.push('| Status | Description |');
        lines.push('|---|---|');
        for (const [status, meta] of Object.entries(responses)) {
          lines.push(`| \`${status}\` | ${meta?.description || '-'} |`);
        }
      }
    }
  }

  lines.push('');
  fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`API reference generated at ${outPath}`);
};

main();
