# Backend (Express API)

## Setup

1. Copy `.env.example` to `.env`
2. Configure required values:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `CORS_ORIGINS`

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Swagger

- UI: `GET /api/docs`
- JSON: `GET /api/docs.json`

Regenerate JSON:

```bash
npm run swagger:gen
```
