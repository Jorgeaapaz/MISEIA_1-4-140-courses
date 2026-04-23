<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Specification: SaaS Course Content Platform

## Overview
A SaaS application to manage and deliver course content. Two roles exist:
- **Admin**: creates and maintains courses, sections, and resources.
- **Student**: browses and consumes course content, and can leave feedback on resources.

Courses contain ordered sections; sections contain ordered resources. Resources are Markdown files that may reference videos, PDFs, etc. Both sections and resources are numbered to preserve desired order.

---

## Design Guidelines
- Dark theme for better readability.
- Clean, modern storefront feel — bold typography, clear CTAs.
- Single consistent accent color across all pages.
- No images — use category-colored CSS-only icon placeholders.
- Mobile-responsive layouts.
- Use the `frontend-design` skill for every new page/component — never write plain unstyled HTML.
- Build a professional landing page with `frontend-design`.

---

## Architecture

### Database
- **MongoDB** with the native driver (no Mongoose).
- Database name: `saas-cursos`.
- All DB access must go through `lib/db.ts` singleton — never create a new `MongoClient` inline.

### Storage
- **AWS S3-compatible** via **Rustfs** running in Docker for multimedia files (PDFs, videos, audios, etc.).

### Mail
- **Mailhog** running in Docker for transactional email (magic links).

### Frontend
- **Next.js** with **TypeScript**.
- No `middleware.ts` — use a proxy instead.
- Global context (`GlobalContext`) for shared state (authenticated user, preferences, etc.) — no prop drilling.
- Run `npm run build` only after coding is complete, not after each change.

---

## Authentication
1. JWT-based authentication with **magic links** (passwordless login), stored in MongoDB.
2. Flow:
   a. User enters their email.
   b. A short-lived JWT (15 min) is generated and sent as a magic link via email.
   c. On click, the token is verified; if valid, the user is authenticated and redirected.
3. Store JWT in **localStorage** — **NO COOKIES**.
4. Validate JWT on every API route request.

---

## Coding Rules
1. Read Next.js docs in `node_modules/next/dist/docs` before using any API.
2. All DB access goes through `lib/db.ts` singleton.
3. All monetary values stored and computed in **cents** (integers) — format for display only.
4. API routes return `{ error: string }` on failure with the appropriate HTTP status code.
5. No `any` types — use TypeScript interfaces defined in `lib/types.ts`.
6. Server components fetch data directly from MongoDB; client components call API routes.
7. Use `frontend-design` skill for every new page/component.

---

## Testing Rules
1. **Playwright** for end-to-end tests covering critical flows (login, course navigation, feedback submission, etc.).
2. **Jest** for unit tests of critical functions in `lib/` (JWT handling, data validation, etc.).
3. Write tests before implementing new features (TDD).
4. Configure CI to run tests automatically.

---

## Git & Repository
- Commit messages follow Conventional Commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Organize code in logical folders: `components/`, `pages/`, `lib/`, `utils/`, etc.
- Use feature branches; merge to `main` only when complete.

---

## Seed Data
- Provide seed data with realistic course/section/resource examples.
- Include YouTube video links in Markdown resources where appropriate.

---

## Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=saas-cursos

# AWS S3 / Rustfs
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=saas-cursos-bucket

# Email (Mailhog)
MAILHOG_HOST=localhost
MAIL_PORT=1027

# Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT
JWT_SECRET=magik-link-dev-secret-2026
```

---

## Session Retrospective
Use the `session-retrospective` skill to generate a retrospective at the end of each session.
