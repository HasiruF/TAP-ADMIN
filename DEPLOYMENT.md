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
| Task definition family | `dev-admin` | "Download current ECS task definition" |
| Container name | `admin` | "Render new image into task definition" (must match the container name inside the task def) |
| ECS service | `dev-admin` | "Deploy to Amazon ECS" |
| ECS cluster | `tap-dev` | "Deploy to Amazon ECS" |

The image is deployed by its immutable `:${{ github.sha }}` tag, so the rollout
always gets the exact build from this run.

## Environment variables

| Variable                   | Scope        | Where it is set                        | Notes |
|----------------------------|--------------|----------------------------------------|-------|
| `NEXT_PUBLIC_API_URL`      | **Build**    | GitHub repo *variable* → Docker build arg | Inlined into the browser bundle; changing it requires a rebuild. |
| `NEXT_PUBLIC_PLATFORM_URL` | **Build**    | GitHub repo *variable* → Docker build arg | Inlined into the browser bundle. |
| `BACKEND_API_URL`          | **Runtime**  | ECS task definition (in AWS)           | Server-side BFF fetcher base URL. |
| `NODE_ENV`                 | Runtime      | Dockerfile (`production`)              | |
| `PORT` / `HOSTNAME`        | Runtime      | Dockerfile (`3000` / `0.0.0.0`)        | Standalone server bind; ALB target group → container port 3000. |
| `NEXT_TELEMETRY_DISABLED`  | Both         | Dockerfile (`1`)                       | |

> **Why the split?** In Next.js, `NEXT_PUBLIC_*` values are baked into the
> client JS at build time, so they are passed as `--build-arg`. Server-only
> vars like `BACKEND_API_URL` are read at runtime and belong in the ECS task
> definition — no rebuild needed to change them.

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
cp .env.example .env      # fill in values
docker compose up --build
# → http://localhost:3000
```
