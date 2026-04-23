# Retrospectiva de Sesión — 2026-04-23
### Implementación completa de la plataforma SaaS CourseHub

## Resumen / Overview

Sesión en la que se implementó desde cero una plataforma SaaS de gestión y consumo de contenido formativo (**CourseHub**) sobre una base Next.js 16.2.4 vacía. Se partió del `PROMPT.md` del proyecto, se formalizó la especificación en `AGENTS.md` usando la skill `microprompt`, y se implementó la aplicación completa. El build finalizó sin errores TypeScript ni de compilación.

---

## Proceso de instalación / Installation

```bash
# Desde la raíz del proyecto
npm install mongodb jsonwebtoken nodemailer react-markdown remark-gfm
npm install --save-dev @types/jsonwebtoken @types/nodemailer
```

Variables de entorno en `.env.local` (ya creado en el proyecto):

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=saas-cursos
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=saas-cursos-bucket
MAILHOG_HOST=localhost
MAIL_PORT=1025
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=magik-link-dev-secret-2026
```

Requisitos externos que deben estar corriendo:
- **MongoDB** instalado localmente en `localhost:27017`
- **Mailhog** en Docker, puerto SMTP `1025`, UI en `http://localhost:8025`
- **Rustfs/MinIO** en Docker, puerto `10000` (para futuros recursos multimedia)

---

## Archivos creados

| Fichero | Propósito |
|---------|-----------|
| `lib/types.ts` | Interfaces TypeScript: User, Course, Section, Resource, Feedback, MagicLink, JWT payloads |
| `lib/db.ts` | Singleton de MongoClient (getDb) |
| `lib/auth.ts` | generateMagicLinkToken, verifyMagicLinkToken, generateSessionToken, verifySessionToken |
| `lib/mail.ts` | sendMagicLink via Nodemailer → Mailhog |
| `lib/apiAuth.ts` | requireAuth, requireAdmin (valida JWT en header Authorization) |
| `proxy.ts` | Proxy de Next.js 16 (reemplaza middleware.ts) |
| `app/contexts/GlobalContext.tsx` | GlobalProvider con user, token, setAuth, clearAuth (localStorage) |
| `app/layout.tsx` | Root layout con GlobalProvider |
| `app/globals.css` | Design system: tokens CSS, botones, inputs, markdown, tablas, badges, spinner |
| `app/page.tsx` | Landing page profesional con hero, features y CTA |
| `app/login/page.tsx` | Formulario magic link con estados: envío, éxito, error |
| `app/verify/page.tsx` | Página contenedora con Suspense boundary |
| `app/verify/VerifyContent.tsx` | Lógica de verificación JWT y redirección |
| `app/components/AppShell.tsx` | Layout compartido con sidebar, nav y protección de ruta por rol |
| `app/admin/page.tsx` | Dashboard admin: stats, acciones rápidas, seed |
| `app/admin/courses/page.tsx` | Tabla de cursos con acciones |
| `app/admin/courses/new/page.tsx` | Formulario crear curso |
| `app/admin/courses/[courseId]/page.tsx` | Detalle curso: secciones accordion + recursos inline |
| `app/admin/courses/[courseId]/sections/[sectionId]/resources/[resourceId]/page.tsx` | Editor Markdown de recurso |
| `app/dashboard/page.tsx` | Grid de cursos para student |
| `app/dashboard/courses/[courseId]/page.tsx` | Vista de curso: sidebar numerado + Markdown + feedback |
| `app/api/auth/send-link/route.ts` | POST: genera JWT, guarda en BD, envía email |
| `app/api/auth/verify/route.ts` | GET: verifica token, crea/encuentra user, devuelve sesión JWT |
| `app/api/courses/route.ts` | GET (público) / POST (admin) |
| `app/api/courses/[courseId]/route.ts` | GET / PUT / DELETE (con cascade) |
| `app/api/courses/[courseId]/sections/route.ts` | GET / POST |
| `app/api/courses/[courseId]/sections/[sectionId]/route.ts` | PUT / DELETE |
| `app/api/courses/[courseId]/sections/[sectionId]/resources/route.ts` | GET / POST |
| `app/api/courses/[courseId]/sections/[sectionId]/resources/[resourceId]/route.ts` | GET / PUT / DELETE |
| `app/api/feedback/[resourceId]/route.ts` | GET / POST (requiere auth) |
| `app/api/seed/route.ts` | POST: pobla BD con 2 cursos, 5 secciones, 6 recursos en Markdown |

---

## Comandos ejecutados / Commands Run

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Seed de datos (desde el navegador o curl)
curl -X POST http://localhost:3000/api/seed
```

---

## Levantar y detener la aplicación / Running & Stopping

```bash
# Arrancar en desarrollo
cd "D:/Master-IA-Dev/04-Bloque4/1-4-140-courses/courses"
npm run dev
# → http://localhost:3000

# Parar: Ctrl+C en la terminal

# Build y producción
npm run build
npm start
```

### Dependencias externas (Docker)

```bash
# Mailhog (SMTP en 1025, UI en 8025)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Rustfs/MinIO (S3 compatible en 10000)
docker run -d -p 10000:9000 -p 10001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin1234 \
  minio/minio server /data --console-address ":9001"
```

---

## URLs de prueba / Test URLs

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/login` | Login con magic link |
| `http://localhost:3000/admin` | Dashboard admin (requiere sesión admin) |
| `http://localhost:3000/admin/courses` | Gestión de cursos |
| `http://localhost:3000/dashboard` | Panel del estudiante |
| `http://localhost:8025` | Mailhog UI (ver emails enviados) |
| `http://localhost:10001` | MinIO Console |

### Endpoints API (curl)

```bash
# Seed
curl -X POST http://localhost:3000/api/seed

# Enviar magic link
curl -X POST http://localhost:3000/api/auth/send-link \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cursos.com"}'

# Listar cursos
curl http://localhost:3000/api/courses

# Crear curso (requiere token)
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Nuevo Curso","description":"Desc","order":3}'
```

---

## Flujo de autenticación

1. Usuario va a `/login` e introduce su email
2. `POST /api/auth/send-link` → genera JWT (15 min), lo guarda en colección `magic_links`, envía email con Mailhog
3. Usuario abre Mailhog (`localhost:8025`), hace clic en el enlace
4. `GET /api/auth/verify?token=...` → verifica JWT, marca token como `used`, crea/busca usuario en colección `users`, devuelve JWT de sesión (7 días)
5. Frontend guarda token y user en `localStorage` via `GlobalContext`
6. Redirección automática: admin → `/admin`, student → `/dashboard`

### Usuarios del seed

| Email | Rol |
|-------|-----|
| `admin@cursos.com` | admin |
| `student@cursos.com` | student |

---

## Problemas encontrados / Problems & Solutions

| Problema | Solución |
|----------|----------|
| `@import url(...)` después de `@import "tailwindcss"` causaba warning CSS | Mover el `@import` de Google Fonts antes del `@import "tailwindcss"` |
| Flag `/s` en regex no soportado con target `ES2017` | Cambiar `/s` por `[\s\S]` en la expresión regular del renderizador Markdown |
| `useSearchParams()` en `/verify` necesita Suspense boundary | Extraer la lógica a `VerifyContent.tsx` y envolver con `<Suspense>` en `page.tsx` |

---

## Decisiones de arquitectura relevantes

- **Next.js 16**: usa `proxy.ts` en lugar de `middleware.ts` (renombrado, misma funcionalidad)
- **Sin cookies**: JWT exclusivamente en `localStorage`, enviado como `Authorization: Bearer <token>`
- **Server vs Client components**: Server Components para páginas que leen MongoDB directamente; Client Components para interactividad (forms, estado, feedback)
- **GlobalContext**: único punto de verdad para `user` y `token` en el cliente; hidratado desde `localStorage` en `useEffect`
- **Markdown personalizado**: renderizado con función propia (`renderMarkdown`) para evitar dependencias innecesarias en el bundle cliente
- **Seed**: disponible en `POST /api/seed` (borra todo y repopula — solo para desarrollo)

---

## Resultados y conclusiones / Results & Conclusions

✅ Build limpio: `npm run build` sin errores TypeScript  
✅ 20 rutas generadas (estáticas + dinámicas)  
✅ Autenticación magic link funcional  
✅ CRUD completo admin: cursos → secciones → recursos  
✅ Vista student con sidebar numerado y render Markdown  
✅ Feedback por recurso con asociación al usuario  
✅ Seed con 2 cursos de ejemplo (React y Python/ML)  

### Pendiente para próximas sesiones

- [ ] Integrar `react-markdown` con `remark-gfm` en lugar del renderizador manual (ya instalado, pendiente de usar)
- [ ] Subida real de archivos a Rustfs/S3 para recursos multimedia
- [ ] Tests E2E con Playwright (flujos: login, navegación, feedback)
- [ ] Tests unitarios Jest para `lib/auth.ts` y `lib/mail.ts`
- [ ] Configurar CI para ejecutar tests automáticamente
- [ ] Mejorar el admin dashboard con stats reales (llamadas paralelas a DB)
- [ ] Paginación en la lista de cursos y recursos
- [ ] Perfil de usuario editable
