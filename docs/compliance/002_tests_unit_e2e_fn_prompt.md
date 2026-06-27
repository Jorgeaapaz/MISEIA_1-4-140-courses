@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement Jest Unit Tests and Playwright E2E Tests

## Role
Act as a Software Engineer with expertise in testing Next.js applications using Jest and Playwright.

## Context
The project is a Next.js 16 SaaS Course Platform at `D:\Master-IA-Dev\04-Bloque4\1-4-140-courses\courses`.

Current state:
- **Zero test files** — no Jest config, no Playwright config, no `__tests__` directories
- This fails: `cq_tests_minimos` and `cq_cobertura_alta`
- Critical functions in `lib/` (JWT, DB, mail) have no unit test coverage

Key files to test:
- `lib/auth.ts` — `signJwt()`, `verifyJwt()`, `signMagicLink()`, `verifyMagicLink()`
- `lib/apiAuth.ts` — `requireAuth()`, `requireAdmin()`
- `lib/db.ts` — DB singleton behavior
- `app/api/auth/send-link/route.ts` — POST handler
- `app/api/auth/verify/route.ts` — POST handler

E2E critical flows:
1. Login via magic link (send email → click link → authenticated session)
2. Admin CRUD: create course → add section → add resource
3. Student: browse courses → view resource → submit feedback
4. Unauthorized access redirects correctly

## Task
1. Install Jest, `ts-jest`, `@types/jest`, `jest-environment-jsdom`.
2. Install Playwright (`@playwright/test`).
3. Create `jest.config.ts` for unit tests on `lib/` functions.
4. Write unit tests in `__tests__/lib/` for all `lib/` critical functions.
5. Create `playwright.config.ts` for E2E tests.
6. Write E2E tests in `e2e/` covering the 4 critical flows above.
7. Add `"test": "jest"`, `"test:e2e": "playwright test"` scripts to `package.json`.
8. Update README with exact test commands.

## Testing Guidelines
- Unit tests: mock MongoDB client, mock nodemailer transport — test logic, not I/O.
- E2E tests: run against `npm run dev` (port 3000) with a test MongoDB seeded via `/api/seed`.
- Aim for >60% line coverage on `lib/` functions.
- Use `describe`/`it` naming that reads as documentation.
- Each test must be deterministic — no random sleep, no flaky assertions.

## Output Format
```
__tests__/
  lib/
    auth.test.ts       # JWT sign/verify unit tests
    apiAuth.test.ts    # requireAuth / requireAdmin unit tests
e2e/
  auth.spec.ts         # Magic link login flow
  admin-crud.spec.ts   # Course/section/resource CRUD
  student.spec.ts      # Student browse + feedback
jest.config.ts
playwright.config.ts
```

## Steps to Follow
1. Read `lib/auth.ts`, `lib/apiAuth.ts`, `lib/types.ts` to understand interfaces.
2. Install test dependencies.
3. Create Jest config targeting `__tests__/**/*.test.ts`.
4. Write unit tests for `lib/auth.ts` (sign/verify happy path + expiry + invalid token).
5. Write unit tests for `lib/apiAuth.ts` (missing header, expired token, wrong role).
6. Create Playwright config targeting `e2e/**/*.spec.ts`, baseURL `http://localhost:3000`.
7. Write E2E specs for all 4 critical flows.
8. Run `npm test` — all tests must pass before committing.
9. Run `npm run test:e2e` — all E2E tests must pass.
10. Commit: `test: add Jest unit tests and Playwright E2E tests`.

## Output Checklist and Guardrails
- [ ] `jest.config.ts` present
- [ ] `playwright.config.ts` present
- [ ] Unit tests cover `lib/auth.ts` (sign, verify, expiry)
- [ ] Unit tests cover `lib/apiAuth.ts` (401, 403 cases)
- [ ] E2E test covers magic link login flow
- [ ] E2E test covers admin CRUD
- [ ] E2E test covers student feedback submission
- [ ] `npm test` exits 0
- [ ] `npm run test:e2e` exits 0
- [ ] README test commands documented
