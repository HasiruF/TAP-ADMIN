# TAP Admin

Internal administration dashboard for **TAP** (The Artist Platform) — a
marketplace connecting Artists and Venues. Built with Next.js 15 (App
Router), React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.

The admin console lets platform staff review and approve artist/venue
profiles, moderate uploaded media and messages, manage users (suspend / ban /
unlock / reset password), curate the "Resources" list shown to artists and
venues, manage the marketplace vendor directory (categories + listings), and
view platform analytics and activity logs.

## Getting Started

Install dependencies, then run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
`/login` — sign in with an **admin**-role account against the TAP backend
(non-admin credentials are rejected by the login screen).

### Environment variables

Set at least:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

`NEXT_PUBLIC_API_URL` is the base URL the browser calls directly for every
API request (see `src/lib/api/client.ts`). There is no server-side BFF layer
— the only route under `src/app/api/**` is `/api/health`, a local liveness
probe that never touches the backend. `NEXT_PUBLIC_PLATFORM_URL` is also
inlined at build time and used to link out to a venue's live public profile
on the marketing site (see `VenueDetailClient.tsx`).

Because `NEXT_PUBLIC_*` values are inlined into the client bundle at build
time, changing `NEXT_PUBLIC_API_URL` requires restarting `next dev` (or
rebuilding for production).

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Local dev server |
| `npm run build` | `next build` | Production build (`output: 'standalone'`) |
| `npm run start` | `next start` | Run a production build locally |
| `npm run lint` | `eslint .` | Lint |
| `npm run lint:fix` | `next lint --fix` | Lint with autofix |
| `npm run format` | `prettier --write .` | Format |
| `npm test` | `jest` | Run unit tests (`src/_tests_/`) |
| `npm run docker:build` | `docker build -t tap-admin .` | Build the production Docker image |
| `npm run docker:run` | `docker run -p 3000:3000 tap-admin` | Run the built image |

A Husky pre-commit hook runs `lint-staged` (prettier + eslint --fix) on
staged `.ts`/`.tsx`/`.js`/`.jsx` files.

## Project docs

- [AGENTS.md](AGENTS.md) — Next.js version landmines and TAP Admin-specific
  gotchas (auth model, no BFF layer, etc.) for AI coding agents.
- [DEPLOYMENT.md](DEPLOYMENT.md) — CI/CD pipeline and AWS ECS deployment.
- [tap_admin_project_structure.md](tap_admin_project_structure.md) —
  directory layout, API call architecture, auth flow, routing.
- [tap_admin_screens_inventory.md](tap_admin_screens_inventory.md) —
  per-screen UI/behaviour inventory.
- [tap_admin_data_contracts.md](tap_admin_data_contracts.md) — every field
  and endpoint the admin UI reads or sends.

The remaining root-level markdown files
(`TAP_ADMIN_ANALYSIS.md`, `tap_admin_backend_gap_analysis.md`,
`approval_endToend_development.md`, `tap_admin_action_workflows.md`) are
point-in-time engineering snapshots, not maintained references — read the
audit notes at the top of each for what has since changed.

## Docker / production-parity run

```bash
docker compose up --build
# → http://localhost:3000
```

`docker-compose.yml` reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_PLATFORM_URL`
(build args, baked into the client bundle) from your shell/`.env`. See
[DEPLOYMENT.md](DEPLOYMENT.md) for the full variable list and the AWS ECS
pipeline.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
