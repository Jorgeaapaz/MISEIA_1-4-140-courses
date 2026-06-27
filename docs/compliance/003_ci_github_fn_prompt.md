@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory ~/MISEIA1-4-140-courses. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker.

The app must be accessible through Traefik using the domain courses.deviaaps.com, port 30001, use the traefik wildcard *.deviaaps.com.

Use /gh and gcloud for all secrets required.

## Context
- Project: Next.js 16 SaaS Course Platform (CourseHub)
- Remote VM: `gcvmuser@34.174.56.186` via SSH key `C:\ubuntuiso\.ssh\vboxuser`
- App directory on VM: `~/MISEIA1-4-140-courses`
- Domain: `courses.deviaaps.com` (Traefik wildcard `*.deviaaps.com`)
- Traefik port: 30001
- Network: `miseia-net` (existing bridge network)
- Production env file: `docs/compliance/env.production`
- MongoDB production: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`

## GitHub Actions Pipeline Guidelines
- Trigger on push to `master` branch and on pull requests to `master`
- Jobs:
  1. **test** — run `npm test` (Jest) and `npm run lint`
  2. **build** — run `npm run build` with `NODE_ENV=production` (build command only, not as job-level var)
  3. **deploy** — SSH into VM, pull code, build Docker image, restart container (only on push to master)
- Use GitHub Secrets for: `SSH_PRIVATE_KEY`, `VM_HOST`, `VM_USER`, `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`
- Use `appleboy/ssh-action` for SSH deployment step
- Docker container must join `miseia-net` network
- Traefik labels must set `courses.deviaaps.com` as host rule

## Dockerfile Guidelines
- Base: `node:20-alpine`
- Multi-stage: builder (install + build) → runner (production only)
- EXPOSE 30001
- Health check on `/api/courses` endpoint (requires auth — use `/` instead)
- Copy only `.next/`, `public/`, `package.json`, `package-lock.json`, `node_modules` (production)

## Steps to Follow
1. Read `package.json` and project structure for correct build commands.
2. Create `Dockerfile` at project root (multi-stage).
3. Create `.github/workflows/ci-cd.yml`.
4. Use `/gh` to set GitHub repository secrets:
   - `SSH_PRIVATE_KEY` — content of `C:\ubuntuiso\.ssh\vboxuser`
   - `VM_HOST` — `34.174.56.186`
   - `VM_USER` — `gcvmuser`
   - `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `MAILHOG_HOST`, `MAIL_PORT`
5. Create `docker-compose.courses.yml` on the VM for deployment.
6. Test: push to master and verify GitHub Actions passes all 3 jobs.
7. Verify `https://courses.deviaaps.com` is accessible.
8. Update README with production URL.
9. Commit: `feat: add GitHub Actions CI/CD pipeline and Docker deployment`.

## Output Checklist and Guardrails
- [ ] `Dockerfile` at project root (multi-stage)
- [ ] `.github/workflows/ci-cd.yml` present
- [ ] Pipeline has test, build, deploy jobs
- [ ] `NODE_ENV=production` only on build command, not job-level
- [ ] SSH deployment uses secrets, not hardcoded credentials
- [ ] Container joins `miseia-net` network
- [ ] Traefik label sets `courses.deviaaps.com`
- [ ] `https://courses.deviaaps.com` returns 200
- [ ] README updated with production URL
- [ ] All GitHub Actions jobs pass (green build)
