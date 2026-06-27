@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Dockerfile and Production Deployment for GCI VM

## Role
Act as a Software Architect and IT Infrastructure Engineer with expertise in Docker, Next.js production builds, and Traefik reverse proxy.

## Context
- Project: Next.js 16 SaaS Course Platform (CourseHub)
- Remote VM: `gcvmuser@34.174.56.186`
- SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- App directory on VM: `~/MISEIA1-4-140-courses`
- Domain: `courses.deviaaps.com` via Traefik wildcard `*.deviaaps.com`
- Port: 30001 (internal container port exposed to Traefik)
- Network: `miseia-net` (existing bridge network with Traefik, MongoDB, MailHog, RustFS)
- MongoDB production: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- Production env: `docs/compliance/env.production`

Infrastructure already on VM (from `D:\Master-IA-Dev\00-GoogleCloud\004_Infra_in_VM\docker-compose.yml`):
- Traefik v3.3 with Cloudflare DNS-01 wildcard cert for `*.deviaaps.com`
- MongoDB on port 27020
- MailHog available on `miseia-net`
- RustFS (S3-compatible) on `miseia-net`

## Task
1. Create `Dockerfile` (multi-stage) for the Next.js app.
2. Create `docker-compose.courses.yml` for deployment on the VM.
3. Create `docs/compliance/env.production` with production environment variables (no real secrets in git — file will be transferred to VM via SSH/secrets).
4. Create a `scripts/deploy.sh` helper script for manual or CI deployment.
5. Update README with a "Production Deployment" section.

## Dockerfile Guidelines
```dockerfile
# Stage 1: builder — node:20-alpine
# Install all deps, run npm run build with NODE_ENV=production
# Stage 2: runner — node:20-alpine
# Copy only: .next/standalone, .next/static, public/
# Use Next.js standalone output (set output: 'standalone' in next.config.ts)
# EXPOSE 30001
# ENV PORT=30001
# CMD ["node", "server.js"]
```

**Important:** Add `output: 'standalone'` to `next.config.ts` before building.

## docker-compose.courses.yml Guidelines
```yaml
services:
  coursehub:
    image: coursehub:latest
    container_name: coursehub
    restart: unless-stopped
    env_file: .env.production  # on VM, not in git
    networks:
      - miseia-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.coursehub.rule=Host(`courses.deviaaps.com`)"
      - "traefik.http.routers.coursehub.entrypoints=websecure"
      - "traefik.http.routers.coursehub.tls=true"
      - "traefik.http.routers.coursehub.tls.certresolver=cloudflare"
      - "traefik.http.services.coursehub-svc.loadbalancer.server.port=30001"
networks:
  miseia-net:
    external: true
```

## env.production Content (placeholder — real values go on VM only)
```env
MONGODB_URI=mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin
MONGODB_DB=saas-cursos
JWT_SECRET=<production-secret-here>
MAILHOG_HOST=mailhog
MAIL_PORT=1025
NEXT_PUBLIC_API_URL=https://courses.deviaaps.com
NODE_ENV=production
AWS_USERNAME=rustfsadmin
AWS_PASSWORD=RustfsSecret2024!
AWS_REGION=us-east-1
AWS_URL=http://rustfs:9000
AWS_BUCKET=saas-cursos-bucket
```

## Steps to Follow
1. Read `next.config.ts` — add `output: 'standalone'` if not present.
2. Create `Dockerfile` at project root (multi-stage).
3. Create `docker-compose.courses.yml` at project root.
4. Create `docs/compliance/env.production` with production vars (no real secrets committed; secrets will be set via CI variables or transferred via SSH).
5. Create `scripts/deploy.sh` that SSHes to VM, pulls latest, builds image, and restarts container.
6. SSH to VM and manually test deployment: transfer `.env.production`, run `docker build`, run `docker-compose -f docker-compose.courses.yml up -d`.
7. Verify `https://courses.deviaaps.com` returns the app landing page.
8. Update README "Production Deployment" section with steps.
9. Commit: `feat: add Dockerfile and production deployment config`.

## Output Checklist and Guardrails
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] `Dockerfile` at project root (multi-stage, node:20-alpine)
- [ ] `docker-compose.courses.yml` with Traefik labels for `courses.deviaaps.com`
- [ ] Container on `miseia-net` network (external: true)
- [ ] Port 30001 exposed inside container
- [ ] `docs/compliance/env.production` created (placeholder values for git; real values on VM)
- [ ] `scripts/deploy.sh` deployable via SSH
- [ ] `https://courses.deviaaps.com` accessible and serving the app
- [ ] No real secrets committed to git
- [ ] README production deploy section updated
