# Notes API

The API uses Express and MongoDB. Configure it using `Backend/.env.example`; production startup fails when the database URL or a sufficiently long JWT secret is missing.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `MONGODB_URI` and `JWT_SECRET` before starting. Production requires a newly generated secret of at least 32 characters. `CLIENT_ORIGINS` is a comma-separated allowlist; use exact origins without trailing slashes.

## Production

Set `NODE_ENV=production`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGINS` in the host's environment or secret manager. Serve the API behind HTTPS. When using a reverse proxy, set `TRUST_PROXY` to its exact hop count; do not trust arbitrary forwarded headers.

Authentication endpoints have a per-process IP throttle. It resets on restart and is not shared across instances; enforce distributed rate limits at the gateway/load balancer for multi-instance deployments. The readiness endpoint is `GET /api/health`.
