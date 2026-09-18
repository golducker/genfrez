# GenFreZ frontend

Next.js (App Router) + Tailwind v4. Nothing-inspired monochrome design system (tokens in `src/app/globals.css`).

Pages: `/` home, `/about`, `/solution`, `/contact`. Content lives in `src/lib/site.ts` (team, links, demo URL, video ID).

```bash
npm install
npm run dev
```

Env (optional): `BACKEND_URL` — if set, `/api/contact` proxies to the Express backend.
