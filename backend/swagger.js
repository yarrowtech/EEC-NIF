const fs = require('fs');
const path = require('path');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const toPosix = (filePath) => filePath.split(path.sep).join('/');

const outputFile = toPosix(path.join(__dirname, 'swagger-output.json'));
const routesDir = path.join(__dirname, 'routes');

const routeFiles = fs
  .readdirSync(routesDir)
  .filter((file) => file.endsWith('.js'))
  .map((file) => toPosix(path.join(routesDir, file)));

const endpointsFiles = [toPosix(path.join(__dirname, 'index.js')), ...routeFiles];

const serverUrl =
  process.env.SWAGGER_SERVER_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const doc = {
  info: {
    title: 'Electronic Educare API',
    description: 'API documentation for the Electronic Educare backend.',
    version: '1.0.0',
  },
  servers: [{ url: serverUrl }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log(`Swagger doc generated at ${outputFile}`);
});
