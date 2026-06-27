@~/.claude/prompts/new_functionality_prompt_spec.md

# Create GitLab CI/CD Pipeline and Deploy App to GCI VM

## Role
Act as a Software Architect with expertise in GitLab CI/CD and Google Cloud Infrastructure.

## Context
- Project: Next.js 16 SaaS Course Platform (CourseHub)
- GitLab instance: `gitlab.codecrypto.academy`
- Remote VM: `gcvmuser@34.174.56.186` via SSH key `C:\ubuntuiso\.ssh\vboxuser`
- App directory on VM: `~/MISEIA1-4-140-courses`
- Domain: `courses.deviaaps.com` (Traefik wildcard `*.deviaaps.com`, port 30001)
- Network: `miseia-net` (existing Traefik bridge network)
- Production env file: `docs/compliance/env.production`
- MongoDB production: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`

## Task
Using `/glab`, create a `.gitlab-ci.yml` pipeline that:
1. Runs lint and unit tests on every push and merge request.
2. Builds the Next.js app with `NODE_ENV=production` **only on the build command**, NOT as a job-level variable.
3. Deploys to the GCI VM via SSH on push to `master` branch only.
4. The app runs in Docker, connected to `miseia-net`, routed via Traefik at `courses.deviaaps.com`.

## GitLab CI Guidelines
- Stages: `test`, `build`, `deploy`
- Use GitLab CI/CD Variables (Settings → CI/CD → Variables) for secrets — **never hardcode**
- Required CI variables: `SSH_PRIVATE_KEY`, `VM_HOST`, `VM_USER`, `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `MAILHOG_HOST`, `MAIL_PORT`
- `NODE_ENV=production` must appear ONLY in the build script line: `NODE_ENV=production npm run build`
- Do NOT set `NODE_ENV` as a job-level `variables:` key
- Use `before_script` in deploy stage to set up SSH agent
- Use Docker-in-Docker (`docker:dind`) only if building image in CI; prefer building on VM directly via SSH
- Cache `node_modules` between jobs using `cache: key: $CI_COMMIT_REF_SLUG`

## Pipeline Stages Detail

### stage: test
```yaml
# Run on all branches, all MRs
# Script: npm ci && npm run lint && npm test
# Image: node:20-alpine
```

### stage: build  
```yaml
# Run on master only
# Script: npm ci && NODE_ENV=production npm run build
# Artifact: .next/ directory
```

### stage: deploy
```yaml
# Run on master only, after build
# Script: SSH to VM, git pull, docker build, docker-compose up -d
# Uses: SSH_PRIVATE_KEY, VM_HOST, VM_USER variables
```

## Steps to Follow
1. Read `package.json` for script names.
2. Use `/glab` to set CI/CD variables in the GitLab project at `gitlab.codecrypto.academy`.
3. Create `.gitlab-ci.yml` at project root.
4. Ensure `Dockerfile` exists (coordinate with `005_deploy_docker_fn_prompt.md`).
5. Push `.gitlab-ci.yml` and verify pipeline runs green on GitLab.
6. Confirm deployment to `https://courses.deviaaps.com`.
7. Commit: `feat: add GitLab CI/CD pipeline`.

## Output Checklist and Guardrails
- [ ] `.gitlab-ci.yml` at project root
- [ ] Stages: test → build → deploy
- [ ] `NODE_ENV=production` only on npm run build script line, NOT job-level variable
- [ ] All secrets via GitLab CI variables, none hardcoded
- [ ] SSH setup uses `SSH_PRIVATE_KEY` variable
- [ ] Deploy stage only runs on `master` branch
- [ ] node_modules cached between jobs
- [ ] Pipeline passes all stages (green)
- [ ] App accessible at `https://courses.deviaaps.com`
