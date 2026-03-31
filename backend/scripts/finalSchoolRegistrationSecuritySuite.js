/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_BASE || 'http://localhost:5000';
const OUTPUT_PATH = path.join(__dirname, 'final-school-registration-security-report.json');

const nowSeed = Date.now();

const validPayload = (suffix = 'ok') => ({
  name: `Secure School ${suffix}`,
  campuses: [
    {
      name: `Main Campus ${suffix}`,
      address: '123 Long Main Campus Address, Kolkata, WB 700001',
      campusType: 'Main',
      contactPerson: 'Coordinator',
      contactPhone: '+919876543210',
    },
  ],
  officialEmail: `security.${suffix}@example.org`,
  contactPersonName: 'School Contact',
  contactPhone: '+919876543211',
  address: '123 Main School Address, Kolkata, West Bengal 700001',
  schoolType: 'Private',
  board: 'CBSE',
  boardOther: '',
  academicYearStructure: 'Semester',
  estimatedUsers: '100-500',
  websiteURL: 'https://example-school.org',
  logo: { secure_url: 'https://example.org/logo.png' },
  verificationDocs: [{ secure_url: 'https://example.org/doc.pdf' }],
});

const callJson = async ({ method = 'GET', path: routePath, headers = {}, body }) => {
  const response = await fetch(`${BASE_URL}${routePath}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch (_err) {
    // Keep raw text.
  }
  return {
    method,
    path: routePath,
    headers,
    requestBody: body,
    status: response.status,
    responseBody: data,
    requestId: response.headers.get('x-request-id') || null,
    traceId: response.headers.get('x-trace-id') || null,
  };
};

const callMalformedJson = ({ routePath, rawBody, headers = {} }) =>
  new Promise((resolve) => {
    const target = new URL(`${BASE_URL}${routePath}`);
    const req = http.request(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname + target.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let parsed = raw;
          try {
            parsed = JSON.parse(raw);
          } catch (_err) {
            // Keep raw.
          }
          resolve({
            method: 'POST',
            path: routePath,
            headers,
            requestBody: rawBody,
            status: res.statusCode || -1,
            responseBody: parsed,
            requestId: res.headers['x-request-id'] || null,
            traceId: res.headers['x-trace-id'] || null,
          });
        });
      }
    );
    req.on('error', (err) => {
      resolve({
        method: 'POST',
        path: routePath,
        headers,
        requestBody: rawBody,
        status: -1,
        responseBody: { error: err.message },
        requestId: null,
        traceId: null,
      });
    });
    req.write(rawBody);
    req.end();
  });

const summarize = (calls) => ({
  total: calls.length,
  status200: calls.filter((c) => c.status === 200).length,
  status201: calls.filter((c) => c.status === 201).length,
  status400: calls.filter((c) => c.status === 400).length,
  status401: calls.filter((c) => c.status === 401).length,
  status409: calls.filter((c) => c.status === 409).length,
  status429: calls.filter((c) => c.status === 429).length,
});

const run = async () => {
  const scenarios = [];

  // A) Baseline success + duplicate
  const baselineCalls = [];
  const baselinePayload = validPayload(`${nowSeed}-baseline`);
  baselineCalls.push(await callJson({
    method: 'POST',
    path: '/api/school-registration',
    body: baselinePayload,
    headers: { 'user-agent': 'baseline-client/1.0' },
  }));
  baselineCalls.push(await callJson({
    method: 'POST',
    path: '/api/school-registration',
    body: baselinePayload,
    headers: { 'user-agent': 'baseline-client/1.1' },
  }));
  scenarios.push({ name: 'baseline_success_and_duplicate', calls: baselineCalls, summary: summarize(baselineCalls) });

  // B) Injection and dangerous payloads
  const injectionCalls = [];
  injectionCalls.push(await callJson({
    method: 'POST',
    path: '/api/school-registration',
    body: { ...validPayload(`${nowSeed}-xss`), name: '<script>alert(1)</script>' },
    headers: { 'user-agent': 'xss-probe/1.0' },
  }));
  injectionCalls.push(await callJson({
    method: 'POST',
    path: '/api/school-registration',
    body: { ...validPayload(`${nowSeed}-nosql`), officialEmail: { $ne: null } },
    headers: { 'user-agent': 'nosql-probe/1.0' },
  }));
  scenarios.push({ name: 'injection_and_payload_abuse', calls: injectionCalls, summary: summarize(injectionCalls) });

  // C) Flood + bypass simulation (single IP should hit 429, rotated spoof should avoid 429)
  const floodSingle = [];
  for (let i = 0; i < 5; i += 1) {
    floodSingle.push(await callJson({
      method: 'POST',
      path: `/api/school-registration?flood=single-${i}`,
      body: validPayload(`${nowSeed}-single-${i}`),
      headers: { 'x-forwarded-for': '198.51.100.200', 'user-agent': `flood-single/${i}` },
    }));
  }
  const floodRotate = [];
  for (let i = 0; i < 5; i += 1) {
    floodRotate.push(await callJson({
      method: 'POST',
      path: `/api/school-registration?flood=rotate-${i}`,
      body: validPayload(`${nowSeed}-rotate-${i}`),
      headers: { 'x-forwarded-for': `198.51.100.${220 + i}`, 'user-agent': `flood-rotate/${i}` },
    }));
  }
  scenarios.push({ name: 'flood_single_ip', calls: floodSingle, summary: summarize(floodSingle) });
  scenarios.push({ name: 'flood_rotating_xff_probe', calls: floodRotate, summary: summarize(floodRotate) });

  // D) Malformed JSON + header spoofing
  const malformedCalls = [];
  malformedCalls.push(await callMalformedJson({
    routePath: '/api/school-registration',
    rawBody: '{"name":"Broken JSON"',
    headers: {
      'x-forwarded-for': '203.0.113.5, 127.0.0.1',
      'user-agent': 'malformed-json-probe/1.0',
    },
  }));
  scenarios.push({ name: 'malformed_json_and_header_spoof', calls: malformedCalls, summary: summarize(malformedCalls) });

  // E) Brute force baseline signal from admin auth (for SOC baseline correlation)
  const bruteCalls = [];
  for (let i = 0; i < 4; i += 1) {
    bruteCalls.push(await callJson({
      method: 'POST',
      path: '/api/admin/auth/login',
      body: { username: 'admin', password: `WrongPass-${i}` },
      headers: { 'x-forwarded-for': '203.0.113.77', 'user-agent': `brute-baseline/${i}` },
    }));
  }
  scenarios.push({ name: 'brute_force_auth_baseline', calls: bruteCalls, summary: summarize(bruteCalls) });

  const allCalls = scenarios.flatMap((s) => s.calls);
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    objective: 'production-grade school-registration security + observability validation',
    scenarios,
    aggregate: summarize(allCalls),
    correlation: {
      requestIds: allCalls.map((c) => c.requestId).filter(Boolean),
      traceIds: allCalls.map((c) => c.traceId).filter(Boolean),
      missingRequestIdCount: allCalls.filter((c) => !c.requestId).length,
      missingTraceIdCount: allCalls.filter((c) => !c.traceId).length,
    },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
};

run().catch((err) => {
  console.error('security suite failed', err);
  process.exit(1);
});
