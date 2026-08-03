# Deploying TAP Admin to AWS ECS

CI builds a Docker image, pushes it to Amazon ECR, then deploys it to the
**existing** ECS service. The task definition lives in AWS (not this repo) — the
deploy job pulls the live definition, swaps in the new image, and rolls it out.
This mirrors the format used by `kainotech/tap-be`.

Workflow: [.github/workflows/dev.yml](.github/workflows/dev.yml) — runs on push
to `dev` (or manual dispatch). Two jobs: `build`, then `deploy`.

## Pipeline

```
push to dev ─► [build] OIDC ─► ECR login ─► docker build (--build-arg NEXT_PUBLIC_*) ─► push (sha + latest)
            ─► [deploy] describe-task-definition (dev-admin) ─► render new image ─► deploy to ECS service
```

## ⚠️ Confirm these hardcoded AWS resource names

Following the tap-be format, the deploy job hardcodes the resource names. Verify
they match your admin app's AWS setup and edit
[.github/workflows/dev.yml](.github/workflows/dev.yml) if not:

| Setting | Current value | Where |
|---------|---------------|-------|
| Task definition family | `dev-admin-panel` | "Download current ECS task definition" |
| Container name | `admin-panel` | "Render new image into task definition" (must match the container name inside the task def) |
| ECS service | `dev-admin-panel` | "Deploy to Amazon ECS" |
| ECS cluster | `tap-dev` | "Deploy to Amazon ECS" |

The image is deployed by its immutable `:${{ github.sha }}` tag, so the rollout
always gets the exact build from this run.

## Environment variables

| Variable                   | Scope        | Where it is set                        | Notes |
|----------------------------|--------------|----------------------------------------|-------|
| `NEXT_PUBLIC_API_URL`      | **Build**    | GitHub repo *variable* → Docker build arg | Inlined into the browser bundle; this is the base URL the browser calls **directly** for every admin API request (`src/lib/api/client.ts`). Changing it requires a rebuild. |
| `NEXT_PUBLIC_PLATFORM_URL` | **Build**    | GitHub repo *variable* → Docker build arg | Inlined into the browser bundle; used to link out to a venue's live public profile on the marketing site. |
| `BACKEND_API_URL`          | **Runtime**  | ECS task definition (in AWS) / `docker-compose.yml` | Wired through by compose and the ECS task definition, but **not currently read by any app code** — there is no server-side BFF layer anymore (the app talks to the backend directly via `NEXT_PUBLIC_API_URL`). Only `src/app/api/health/route.ts` exists under `src/app/api/**`, and it doesn't touch the backend. Safe to leave set (harmless) or drop once the task definition is next touched. |
| `NODE_ENV`                 | Runtime      | Dockerfile (`production`)              | |
| `PORT` / `HOSTNAME`        | Runtime      | Dockerfile (`3000` / `0.0.0.0`)        | Standalone server bind; ALB target group → container port 3000. |
| `NEXT_TELEMETRY_DISABLED`  | Both         | Dockerfile (`1`)                       | |

> **Why the build/runtime split exists?** In Next.js, `NEXT_PUBLIC_*` values
> are baked into the client JS at build time, so they are passed as
> `--build-arg`. `BACKEND_API_URL` was originally a server-only var for a
> BFF fetcher that read it at runtime; that BFF layer has since been removed
> in favor of calling the backend directly from the browser, so this variable
> is currently a no-op — see [AGENTS.md](AGENTS.md) and
> [tap_admin_project_structure.md](tap_admin_project_structure.md) for the
> current architecture.

## One-time GitHub configuration

Set these under the `dev` environment (Settings → Environments → dev) or at repo
scope. Names match the tap-be workflow.

**Variables:**

| Name | Example |
|------|---------|
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `tap-admin` |
| `NEXT_PUBLIC_API_URL` | `https://api.tap.example.com/api/v1` |
| `NEXT_PUBLIC_PLATFORM_URL` | `https://app.tap.example.com` |

**Secrets:**

| Name | Value |
|------|-------|
| `AWS_ROLE_TO_ASSUME` | ARN of the IAM role GitHub Actions assumes via OIDC |

## OIDC role requirements

The `AWS_ROLE_TO_ASSUME` role must:

1. Trust GitHub's OIDC provider (`token.actions.githubusercontent.com`) scoped
   to this repo, e.g. `repo:<org>/<repo>:ref:refs/heads/dev` and
   `repo:<org>/<repo>:environment:dev`.
2. Have permissions for:
   - **ECR** — `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`,
     `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`,
     `ecr:PutImage`, `ecr:BatchGetImage`.
   - **ECS** — `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`,
     `ecs:UpdateService`, `ecs:DescribeServices`.
   - **IAM** — `iam:PassRole` for the task execution/task roles referenced by the
     `dev-admin` task definition.

## Local production-parity run

```bash
# ensure NEXT_PUBLIC_API_URL / NEXT_PUBLIC_PLATFORM_URL / BACKEND_API_URL
# are available in your shell or a .env file (no .env.example is checked in)
docker compose up --build
# → http://localhost:3000
```
