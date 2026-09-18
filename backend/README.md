# GenFreZ backend

Small Express API behind the GenFreZ site.

| Route | What |
|---|---|
| `GET /api/health` | liveness |
| `GET /api/stats` | headline figures from the business model canvas |
| `GET /api/points?km=5&mode=ebike&tier=A-1` | points calculator (BMC scoring formula) |
| `POST /api/contact` | contact form. Body: `{ name, email, organisation?, message }` |

## Run locally

```bash
npm install
npm run dev        # http://localhost:4000
```

## Env

- `CONTACT_WEBHOOK_URL` — optional. Every contact submission is POSTed here as `{ text }` (Slack/Discord-compatible).
- `CORS_ORIGIN` — optional comma-separated allowlist. Defaults to `*`.

## Deploy

Deployed on Vercel with project root `backend/`. `api/index.ts` wraps the Express app; `vercel.json` routes every path to it.
