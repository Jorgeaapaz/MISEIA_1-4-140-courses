@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example Template and Secure Environment Setup

## Role
Act as a Software Developer and Security Engineer with expertise in Node.js, Next.js, and secrets management best practices.

## Context
The project is a Next.js 16 SaaS Course Platform at `D:\Master-IA-Dev\04-Bloque4\1-4-140-courses\courses`.

Current issues:
- `.env.local` contains real credentials and is the only env file
- No `.env.example` template exists (README references `cp .env.local.example .env.local` but the file is missing)
- This fails compliance criteria: `dc_env_example` and `cq_sin_secretos_en_repo`

Required env vars (from `.env.local`):
```
MONGODB_URI, MONGODB_DB, AWS_USERNAME, AWS_PASSWORD, AWS_REGION, AWS_URL, AWS_BUCKET,
MAILHOG_HOST, MAIL_PORT, NODE_ENV, NEXT_PUBLIC_API_URL, JWT_SECRET
```

## Task
1. Create `.env.example` at the project root with all required variables, placeholder values only (no real secrets).
2. Verify `.env.local` is in `.gitignore` — add it if missing.
3. Update `README.md` to reference `.env.example` correctly (fix the `cp` command).
4. Confirm no real secrets are present in git history (audit command).

## .env.example Guidelines
- Use descriptive placeholder values: `your-jwt-secret-here`, `mongodb://localhost:27017`, etc.
- Include comments grouping variables by service.
- Mirror exactly the variable names used in the codebase.
- Do NOT include real credentials, tokens, or passwords.

## Output Format
- File: `.env.example` at project root
- Updated `.gitignore` (if needed)
- Updated `README.md` env section

## Steps to Follow
1. Read current `.env.local` to extract all variable names.
2. Read `.gitignore` to verify `.env.local` is excluded.
3. Read `README.md` environment section.
4. Create `.env.example` with placeholder values.
5. Update `.gitignore` if `.env.local` is not excluded.
6. Update README `cp` command to use `.env.example`.
7. Run: `git log -p | grep -i "jwt_secret\|password\|secret"` to audit for leaked secrets.
8. Commit: `chore: add .env.example template and secure env config`.

## Output Checklist and Guardrails
- [ ] `.env.example` exists at project root
- [ ] All variables in `.env.local` are present in `.env.example`
- [ ] No real values in `.env.example`
- [ ] `.env.local` is in `.gitignore`
- [ ] README `cp` command uses `.env.example`
- [ ] Git history audit shows no leaked secrets
