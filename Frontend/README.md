# Notes

Notes is a responsive React application backed by an Express API and MongoDB.

## Local development

1. Install the backend and frontend dependencies with `npm install` in each folder.
2. Copy `Backend/.env.example` to `Backend/.env` and set `MONGODB_URI` and a unique `JWT_SECRET` of at least 32 characters.
3. Start the API with `npm run dev` in `Backend`.
4. Start Vite with `npm run dev` in `Frontend`. The development server proxies `/api` requests to `http://localhost:3000`.

The backend accepts the frontend origin from `CLIENT_ORIGINS` (comma-separated for multiple trusted origins). Do not commit environment files.

## Production deployment

- Set `NODE_ENV=production`, `MONGODB_URI`, a generated `JWT_SECRET`, `CLIENT_ORIGINS`, and `PORT` on the API host.
- Build the frontend with `npm run build`. Serve the built `dist` directory over HTTPS.
- Prefer routing `/api` through the same site as the frontend. If the API has a separate URL, set `VITE_API_URL` to its API base (for example, `https://api.example.com/api`) at build time and keep the frontend and API on the same site so the `SameSite=Lax` session cookie can be sent.
- Set `TRUST_PROXY` only to the exact number of trusted reverse-proxy hops. The API's built-in auth throttling is per process; apply distributed rate limiting at the edge when running multiple API instances.
- Use a managed MongoDB deployment with network access controls, backups, and monitoring. Keep credentials and secrets in the hosting platform's secret manager.

Run `npm run lint` and `npm run build` in the frontend before deployment. Run `npm test` in the backend.
