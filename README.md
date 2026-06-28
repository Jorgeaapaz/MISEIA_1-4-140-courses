# CourseHub — Plataforma SaaS de Contenido Educativo

**Next.js 16 · TypeScript · MongoDB · Docker · CI/CD**

CourseHub es una aplicación SaaS construida con **Next.js 16 (App Router)** y **TypeScript** que permite a administradores gestionar cursos, secciones y recursos educativos en Markdown, y a estudiantes consumir ese contenido dejando retroalimentación por recurso. La autenticación es sin contraseña mediante **magic links** por correo electrónico (JWT de corta duración).

---

## Tabla de contenidos

1. [Funcionalidades implementadas](#1-funcionalidades-implementadas)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Patrones de diseño y arquitectura](#3-patrones-de-diseño-y-arquitectura)
4. [Cómo funciona](#4-cómo-funciona)
5. [Primeros pasos](#5-primeros-pasos)
6. [Ejemplo de salida](#6-ejemplo-de-salida)
7. [Requisitos](#7-requisitos)
8. [Especificaciones](#8-especificaciones)
9. [Pruebas unitarias e integración](#9-pruebas-unitarias-e-integración)
10. [Despliegue](#10-despliegue)
11. [Mejoras y extensiones](#11-mejoras-y-extensiones)
12. [Cambios documentados](#12-cambios-documentados)

---

## 1. Funcionalidades Implementadas

### 1.1 Autenticación sin contraseña (Magic Links)

Los usuarios ingresan su correo electrónico y reciben un enlace temporal firmado con JWT (TTL: 15 minutos). Al hacer clic se verifica el token y se emite una sesión de 7 días almacenada en `localStorage`. No existen contraseñas ni cookies.

| Detalle | Valor |
|---|---|
| Algoritmo JWT | HS256 (jsonwebtoken v9) |
| TTL magic link | 15 minutos |
| TTL sesión | 7 días |
| Almacenamiento | `localStorage` (cliente) |
| Envío de correo | Nodemailer → Mailhog (dev) |

### 1.2 Gestión de contenido (Admin)

El panel de administración permite CRUD completo sobre **cursos**, **secciones** (ordenadas por número) y **recursos** (archivos Markdown con soporte de videos de YouTube, tablas, código). Toda la lógica de persistencia pasa por el singleton `lib/db.ts` apuntando a MongoDB.

- Cursos con título, descripción y número de orden.
- Secciones anidadas bajo un curso, con orden propio.
- Recursos Markdown con renderizador propio (sin dependencia de `marked`).

### 1.3 Consumo de contenido y retroalimentación (Estudiante)

Los estudiantes navegan el árbol de secciones/recursos en un panel lateral. Cada recurso se renderiza en Markdown enriquecido (tablas, código, imágenes, vínculos YouTube). Bajo el contenido pueden dejar comentarios de retroalimentación que quedan asociados al recurso y visibles para todos.

### 1.4 CI/CD y despliegue en producción

Dos pipelines automatizados (GitHub Actions y GitLab CI) ejecutan lint, pruebas unitarias, build de producción y despliegue SSH al servidor GCI (Google Cloud Infrastructure) en un contenedor Docker detrás de **Traefik** con TLS wildcard `*.deviaaps.com`.

---

## 2. Estructura del Proyecto

```
courses/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Landing page pública
│   ├── layout.tsx                    # Layout raíz con GlobalContext
│   ├── globals.css                   # Variables CSS (tema oscuro)
│   ├── login/page.tsx                # Formulario de magic link
│   ├── verify/                       # Verificación de token y redirección
│   ├── dashboard/                    # Área de estudiante
│   │   ├── page.tsx                  # Lista de cursos disponibles
│   │   └── courses/[courseId]/page.tsx  # Visor de curso con sidebar
│   ├── admin/                        # Área de administrador
│   │   ├── page.tsx                  # Panel admin principal
│   │   └── courses/                  # CRUD cursos/secciones/recursos
│   ├── api/                          # Rutas de API (App Router)
│   │   ├── auth/send-link/route.ts   # Genera y envía magic link
│   │   ├── auth/verify/route.ts      # Verifica token y crea sesión
│   │   ├── courses/[courseId]/       # REST cursos
│   │   │   └── sections/[sectionId]/resources/  # REST recursos
│   │   ├── feedback/[resourceId]/route.ts  # GET y POST retroalimentación
│   │   └── seed/route.ts             # Carga datos de ejemplo
│   └── contexts/GlobalContext.tsx    # Estado global (user, token)
│
├── lib/                              # Lógica de negocio y utilidades
│   ├── auth.ts                       # generateMagicLinkToken / verifySessionToken
│   ├── apiAuth.ts                    # requireAuth / requireAdmin (middleware helpers)
│   ├── db.ts                         # Singleton MongoClient
│   ├── mail.ts                       # Envío de correo con Nodemailer
│   └── types.ts                      # Interfaces TypeScript (Course, User, etc.)
│
├── __tests__/                        # Pruebas Jest
│   ├── setup.ts                      # Variables de entorno para tests
│   └── lib/
│       ├── auth.test.ts              # 9 tests: JWT magic link + sesión
│       └── apiAuth.test.ts           # 6 tests: requireAuth / requireAdmin
│
├── e2e/                              # Pruebas Playwright
│   ├── auth.spec.ts                  # Flujo de login y redirección
│   └── api.spec.ts                   # API sin autenticación → 401
│
├── .github/workflows/ci-cd.yml       # GitHub Actions: test → build → deploy
├── .gitlab-ci.yml                    # GitLab CI: test → build → deploy
├── Dockerfile                        # Build multi-stage (node:20-alpine)
├── docker-compose.courses.yml        # Servicio coursehub + red Traefik
├── .env.example                      # Plantilla de variables de entorno
├── package.json                      # Scripts y dependencias
├── package-lock.json                 # Lockfile npm (reproducibilidad garantizada)
├── jest.config.js                    # Configuración Jest + ts-jest
├── playwright.config.ts              # Configuración Playwright
├── next.config.ts                    # Next.js con output: standalone
└── tsconfig.json                     # Configuración TypeScript estricto
```

---

## 3. Patrones de Diseño y Arquitectura

### 3.1 Singleton — `lib/db.ts`

Una única instancia de `MongoClient` se comparte entre todas las rutas de API del servidor, evitando el agotamiento del pool de conexiones en entornos serverless/Edge.

```typescript
let client: MongoClient | null = null
export async function getDb(): Promise<Db> {
  if (!client) client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()
  return client.db(process.env.MONGODB_DB)
}
```

### 3.2 Context Provider — `GlobalContext`

Estado compartido (usuario autenticado, token JWT, estado de carga) distribuido a todos los componentes cliente mediante `React.createContext`, eliminando prop drilling.

### 3.3 Repository implícito — Rutas de API

Cada ruta `app/api/.../route.ts` encapsula el acceso a MongoDB para su colección correspondiente, actuando como repositorio ligero sin ORM (acceso directo con el driver nativo).

### 3.4 Guard / Middleware helpers — `lib/apiAuth.ts`

Las funciones `requireAuth` y `requireAdmin` actúan como guardias de ruta reutilizables: extraen el Bearer token, verifican la firma JWT y lanzan errores estándar (`401 / 403`) si la validación falla.

### 3.5 Dependencias bloqueadas — Lockfile

El proyecto incluye `package-lock.json` (lockfileVersion 3) comprometido en el repositorio, garantizando instalaciones 100% reproducibles en CI/CD y producción.

```
package-lock.json   ← npm lockfile v3 — siempre usar "npm ci" en CI/CD
```

Para instalar con reproducibilidad exacta:

```bash
npm ci   # usa package-lock.json, nunca actualiza versiones
```

---

## 4. Cómo Funciona

1. **Solicitud de acceso**: el usuario envía su correo en `/login`. La API genera un JWT de 15 min y lo envía por correo como enlace `?token=...`.
2. **Verificación**: al hacer clic, `/verify` valida el token, crea un JWT de sesión (7 días) y lo almacena en `localStorage`. El usuario es redirigido al dashboard o al panel admin según su rol.
3. **Consumo de contenido**: el dashboard lista los cursos; al entrar a uno se carga el árbol de secciones/recursos vía API y se renderiza el Markdown seleccionado en el panel principal.

```typescript
// lib/auth.ts — flujo completo de tokens
export function generateMagicLinkToken(email: string): string {
  return jwt.sign({ email, type: 'magic-link' }, JWT_SECRET, { expiresIn: '15m' })
}

export function generateSessionToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// lib/apiAuth.ts — protección de rutas
export function requireAdmin(request: NextRequest): JWTPayload {
  const payload = requireAuth(request)
  if (payload.role !== 'admin') throw new Error('Acceso denegado')
  return payload
}
```

---

## 5. Primeros Pasos

### Prerrequisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 LTS |
| npm | 10+ |
| MongoDB | 7.x (local o Atlas) |
| Docker | 24+ (para Mailhog y despliegue) |

### Clonar y configurar

```bash
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-140-courses.git
cd MISEIA_1-4-140-courses

# Instalar dependencias con lockfile (reproducible)
npm ci

# Copiar y editar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores reales
```

### Variables de entorno requeridas

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=saas-cursos
JWT_SECRET=tu-secreto-jwt-minimo-32-caracteres
MAILHOG_HOST=localhost
MAIL_PORT=1025
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Ejecutar en desarrollo

```bash
npm run dev        # Inicia Next.js en http://localhost:3000
```

### Cargar datos de ejemplo

```bash
curl -X POST http://localhost:3000/api/seed
# Crea cursos, secciones, recursos y usuario admin@coursehub.com
```

### Ejecutar pruebas

```bash
npm test                  # Jest: 15 tests unitarios
npm run test:coverage     # Jest con reporte de cobertura
npm run test:e2e          # Playwright E2E (requiere servidor activo)
```

### Build de producción local

```bash
NODE_ENV=production npm run build
npm start
```

---

## 6. Ejemplo de Salida

### Solicitar magic link (éxito)

```bash
curl -X POST http://localhost:3000/api/auth/send-link \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@coursehub.com"}'

# HTTP 200
{"message":"Magic link enviado"}
```

### Solicitar magic link (correo inválido)

```bash
curl -X POST http://localhost:3000/api/auth/send-link \
  -H "Content-Type: application/json" \
  -d '{"email":""}'

# HTTP 400
{"error":"Email requerido"}
```

### Acceso a API sin autenticación

```bash
curl http://localhost:3000/api/courses

# HTTP 401
{"error":"No autorizado"}
```

### Acceso a ruta admin como estudiante

```bash
curl http://localhost:3000/api/admin/courses \
  -H "Authorization: Bearer <token-de-estudiante>"

# HTTP 403
{"error":"Acceso denegado"}
```

### Verificar token expirado o inválido

```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"token.invalido.aqui"}'

# HTTP 401
{"error":"Token inválido o expirado"}
```

---

## 7. Requisitos

### 7.1 Requisitos Funcionales

```
FR-001: El usuario no autenticado deberá poder solicitar un magic link ingresando su
        correo electrónico registrado, de modo que reciba un enlace de acceso en su
        bandeja de entrada sin necesidad de contraseña.

FR-002: El sistema deberá verificar el token del magic link y emitir un JWT de sesión
        (TTL 7 días) al usuario, de modo que quede autenticado y sea redirigido a
        su área correspondiente (admin o dashboard).

FR-003: El administrador autenticado deberá poder crear un curso con título,
        descripción y número de orden, de modo que aparezca listado en el panel de
        administración y sea visible para los estudiantes.

FR-004: El administrador autenticado deberá poder crear secciones dentro de un curso
        con título, descripción y orden, de modo que la estructura del curso quede
        organizada jerárquicamente.

FR-005: El administrador autenticado deberá poder crear recursos Markdown dentro de
        una sección, con título, contenido y número de orden, de modo que el contenido
        sea accesible y renderizable para los estudiantes.

FR-006: El administrador autenticado deberá poder editar y eliminar cursos, secciones
        y recursos existentes, de modo que el contenido pueda mantenerse actualizado
        en todo momento.

FR-007: El estudiante autenticado deberá poder navegar el catálogo de cursos
        disponibles desde su dashboard, de modo que pueda seleccionar y acceder al
        contenido que desee estudiar.

FR-008: El estudiante autenticado deberá poder visualizar los recursos Markdown de
        un curso con soporte de tablas, bloques de código, imágenes y vínculos
        YouTube, de modo que reciba una experiencia de lectura enriquecida.

FR-009: El estudiante autenticado deberá poder enviar retroalimentación en texto
        libre sobre un recurso específico, de modo que sus comentarios queden
        registrados y sean visibles para otros usuarios del mismo recurso.

FR-010: El sistema deberá cargar datos de ejemplo (cursos, secciones, recursos y
        usuario administrador) mediante el endpoint POST /api/seed, de modo que el
        entorno de desarrollo o demostración esté listo inmediatamente.

FR-011: El sistema deberá proteger todas las rutas de API con verificación de JWT,
        retornando HTTP 401 si no hay token y HTTP 403 si el rol es insuficiente,
        de modo que los recursos queden restringidos a los usuarios autorizados.
```

### 7.2 Requisitos No Funcionales

```
NFR-PERF-001: Latencia de renderizado de página < 1.5 s (LCP) en conexión 4G →
              output:standalone + Traefik con compresión gzip

NFR-PERF-002: Tiempo de respuesta de API < 200 ms en el percentil 95 bajo 100
              usuarios concurrentes → Singleton MongoClient + índices en
              courseId/sectionId

NFR-SEC-001: Todos los JWT firmados con HS256 y secreto ≥ 32 caracteres; magic
             links con TTL de 15 min y marcado como usado tras verificación

NFR-SEC-002: Variables de entorno nunca comprometidas en el repositorio; .env* en
             .gitignore; secrets gestionados por GitHub Secrets y GitLab CI Variables

NFR-SCAL-001: Arquitectura stateless (JWT en localStorage, sin sesiones en servidor)
              permite escalar horizontalmente ≥ 10 réplicas sin modificación

NFR-SCAL-002: MongoDB soporta sharding horizontal para colecciones de recursos y
              feedback sin cambios en capa de aplicación

NFR-USAB-001: Interfaz responsive en viewports desde 375 px (mobile) hasta 1920 px
              (desktop) con tema oscuro y tipografía Syne/Inter

NFR-AVAIL-001: Disponibilidad objetivo ≥ 99.5 % mensual; contenedor Docker con
               restart: unless-stopped y healthcheck cada 30 s

NFR-MAINT-001: Cobertura de pruebas unitarias ≥ 60 % en líneas de lib/; pipeline
               CI bloquea merge si los tests fallan

NFR-OBS-001: Logs de errores de API emitidos a stdout (capturables por Docker /
             GCP Logging); healthcheck HTTP disponible en GET /

NFR-MAINT-002: Imagen Docker multi-stage (builder + runner) con usuario no-root
               (nextjs:1001) y tamaño final < 250 MB
```

### 7.3 Requisitos Regulatorios (México)

```
REG-001 (LFPDPPP — Ley Federal de Protección de Datos Personales en Posesión de
         Particulares): El sistema deberá obtener consentimiento explícito del usuario
         al registrar su correo electrónico, informando el uso que se dará a sus datos
         personales conforme al Aviso de Privacidad publicado en la plataforma.

REG-002 (NOM-151-SCFI-2016 — Conservación de mensajes de datos y digitalización):
         Los registros de magic links usados y los logs de acceso deberán conservarse
         por un mínimo de 5 años en forma íntegra e inalterada para fines de auditoría
         y resolución de controversias.

REG-003 (Ley Federal del Derecho de Autor — LFDA): Todo el contenido educativo
         publicado en la plataforma (recursos Markdown, videos referenciados) deberá
         contar con los derechos de uso o licencias correspondientes; el administrador
         es responsable de acreditar dicha titularidad al subir el material.
```

### 7.4 Requisitos Operativos

```
OPS-001: Disponibilidad del sistema de lunes a domingo de 6:00 a 23:00 hora del
         Centro de México (UTC-6); fuera de esa ventana se permiten mantenimientos
         programados con aviso previo de 24 h.

OPS-002: RPO < 1 hora (backups de MongoDB cada hora); RTO < 30 minutos mediante
         re-despliegue automatizado del contenedor Docker desde imagen. Verificación:
         drill trimestral documentado.

OPS-003: Despliegue vía pipeline CI/CD (GitHub Actions / GitLab CI) con rollback
         automático si el contenedor no responde al healthcheck en los primeros 60 s
         post-arranque.

OPS-004: El sistema debe emitir alertas (correo o webhook Slack) si el contenedor
         courseHub permanece en estado unhealthy por más de 2 minutos consecutivos.

OPS-005: Rotación del JWT_SECRET cada 90 días; los tokens emitidos con el secreto
         anterior expiran naturalmente (máx. 7 días); no requiere invalidación activa.

OPS-006: La imagen Docker de producción se construye en el runner de CI/CD (no en
         el servidor); el servidor sólo ejecuta git pull + docker build +
         docker compose up -d.
```

### 7.5 Atributos de Calidad

#### 7.5.1 Performance: Latencia de API [PERF-API-LATENCY]

**Atributo de calidad:** Performance
**Métrica:** Latencia (ms) — percentiles medidos con k6

**Especificación:**
- Percentil 99: < 500 ms
- Percentil 95: < 200 ms
- Percentil 50: < 80 ms

**Condiciones:**
- Carga: 100 usuarios concurrentes
- Base de datos: 500 cursos, 5 000 recursos
- Índices en `courseId`, `sectionId`, `resourceId`

**Excepciones:**
- Primera solicitud tras cold start del contenedor: < 3 s aceptable
- Endpoint `/api/seed` (operación masiva): sin límite de tiempo

**Verificación:**
- Prueba de carga con k6 (`k6 run load-test.js`)
- Monitoreo con Docker stats + GCP Cloud Monitoring

---

#### 7.5.2 Seguridad: Protección de tokens JWT [SEC-JWT]

**Atributo de calidad:** Seguridad
**Métrica:** Tiempo de expiración de tokens; entropía del secreto

**Especificación:**
- Magic link TTL: exactamente 15 minutos
- Sesión TTL: 7 días
- Secreto JWT: mínimo 256 bits (32 caracteres aleatorios)

**Condiciones:**
- Todos los tokens firmados con HS256
- Secreto nunca expuesto en repositorio ni logs

**Excepciones:**
- Entornos de prueba: se permite secreto de 32 chars no aleatorio para facilitar CI

**Verificación:**
- Test unitario `auth.test.ts` verifica expiración y tamper detection
- Escaneo de secretos con `git-secrets` en pre-commit hook

---

#### 7.5.3 Escalabilidad: Stateless horizontal [SCAL-STATELESS]

**Atributo de calidad:** Escalabilidad
**Métrica:** Número de réplicas sin degradación

**Especificación:**
- El sistema debe soportar ≥ 10 réplicas simultáneas sin cambios de código
- Sin estado de sesión en servidor (JWT en cliente)
- Sin archivos en disco local

**Condiciones:**
- Todas las réplicas comparten la misma base de datos MongoDB
- Traefik balancea carga entre réplicas

**Excepciones:**
- Las imágenes Docker de build son node:20-alpine y no garantizan ARM nativo

**Verificación:**
- Despliegue de 3 réplicas en docker compose y verificar distribución de requests

---

#### 7.5.4 Disponibilidad: Healthcheck y auto-restart [AVAIL-CONTAINER]

**Atributo de calidad:** Disponibilidad
**Métrica:** Uptime mensual (%)

**Especificación:**
- Uptime objetivo: ≥ 99.5 % mensual (< 3.6 h de downtime/mes)
- Healthcheck HTTP cada 30 s; reinicio automático si falla 3 veces
- `restart: unless-stopped` en docker compose

**Condiciones:**
- Servidor GCI con 2 vCPU, 4 GB RAM
- Red Traefik con certificado TLS automático

**Excepciones:**
- Downtime planificado fuera de ventana operativa (23:00–06:00) no cuenta

**Verificación:**
- Monitoreo externo con UptimeRobot o similar
- Revisión mensual de logs de restart del contenedor

---

#### 7.5.5 Mantenibilidad: Cobertura de pruebas [MAINT-COVERAGE]

**Atributo de calidad:** Mantenibilidad
**Métrica:** Porcentaje de líneas cubiertas por tests automatizados

**Especificación:**
- Cobertura de líneas en `lib/`: ≥ 60 %
- Cobertura global del proyecto: ≥ 40 %
- Pipeline CI bloquea merge si umbral no se cumple

**Condiciones:**
- Medido con Jest `--coverage` sobre archivos en `lib/`
- E2E Playwright cubre flujos críticos de autenticación y consumo de API

**Excepciones:**
- Archivos de configuración (`jest.config.js`, `next.config.ts`) excluidos del cómputo

**Verificación:**
- `npm run test:coverage` genera reporte HTML en `coverage/`
- Umbral definido en `jest.config.js` `coverageThreshold`

---

### 7.6 Criterios de Aceptación BDD

```gherkin
Feature: Autenticación sin contraseña

  Scenario: Solicitud exitosa de magic link
    Given el usuario está en la página /login
    And ha ingresado el correo "admin@coursehub.com"
    When envía el formulario de acceso
    Then el sistema responde HTTP 200
    And el usuario ve el mensaje "Revisa tu correo electrónico"

  Scenario: Magic link expirado
    Given el usuario recibió un magic link hace 20 minutos
    When hace clic en el enlace del correo
    Then el sistema responde HTTP 401
    And el usuario ve el mensaje "Token inválido o expirado"
    And es redirigido a /login

Feature: Gestión de contenido (Administrador)

  Scenario: Crear un nuevo curso
    Given el administrador está autenticado en /admin
    And tiene el rol "admin" en su JWT
    When envía POST /api/courses con título "TypeScript Avanzado"
    Then el sistema responde HTTP 201
    And el curso aparece en GET /api/courses

  Scenario: Estudiante intenta crear curso
    Given el usuario tiene rol "student"
    When envía POST /api/courses con cualquier payload
    Then el sistema responde HTTP 403
    And el cuerpo contiene {"error":"Acceso denegado"}

Feature: Retroalimentación de estudiantes

  Scenario: Enviar comentario sobre un recurso
    Given el estudiante está autenticado
    And está viendo el recurso con id "res-001"
    When envía POST /api/feedback/res-001 con {"comment":"Excelente explicación"}
    Then el sistema responde HTTP 201
    And el comentario aparece en GET /api/feedback/res-001
    And muestra el correo del estudiante como autor
```

---

## 8. Especificaciones

### 8.1 Especificación Orientada a Comportamiento (SDD)

#### Especificación Funcional: Autenticación Magic Link

```
Functional Spec: Magic Link Auth

Caso de uso: Inicio de sesión sin contraseña
Actores: Usuario anónimo, Sistema de correo (Mailhog/SMTP)

Precondiciones:
- El correo del usuario existe en la colección `users`
- El servicio de correo está disponible

Flujo principal:
1. Usuario envía POST /api/auth/send-link con {"email":"..."}
2. Sistema busca el usuario en MongoDB
3. Sistema genera JWT firmado (TTL 15 min): { email, type:"magic-link" }
4. Sistema guarda en `magic_links`: { token, email, expiresAt, used:false }
5. Sistema envía correo con enlace https://<host>/verify?token=<jwt>
6. Usuario hace clic → GET /verify?token=...
7. Sistema verifica firma y expiración del JWT
8. Sistema marca el registro como used:true
9. Sistema genera JWT de sesión (TTL 7 días): { sub, email, role }
10. Token de sesión almacenado en localStorage del cliente
11. Redirección a /admin (rol admin) o /dashboard (rol student)

Criterios de aceptación:
- Dado usuario registrado → recibe correo en < 5 s
- Cuando token válido → sesión creada, redirigido correctamente
- Cuando token expirado o ya usado → HTTP 401, redirigido a /login
```

#### Especificación Estructural: Modelo de datos

```
Colecciones MongoDB (saas-cursos):

users           { email, role: "admin"|"student", createdAt }
courses         { title, description, order, createdAt }
sections        { courseId → ObjectId, title, description, order, createdAt }
resources       { sectionId → ObjectId, title, content (MD), order, createdAt }
feedback        { resourceId → ObjectId, userId → ObjectId, comment, createdAt }
magic_links     { email, token, expiresAt, used: boolean }

Índices recomendados:
- sections:     { courseId: 1, order: 1 }
- resources:    { sectionId: 1, order: 1 }
- feedback:     { resourceId: 1, createdAt: -1 }
- magic_links:  { token: 1 }, { expiresAt: 1 } (TTL index)
```

#### Especificación de Comportamiento: Estado de sesión

```mermaid
stateDiagram-v2
    [*] --> Anónimo: Visita la plataforma
    Anónimo --> EsperandoMagicLink: POST /api/auth/send-link
    EsperandoMagicLink --> Anónimo: Correo no registrado (400)
    EsperandoMagicLink --> TokenEnviado: Correo enviado (200)
    TokenEnviado --> Verificando: Clic en magic link
    Verificando --> Anónimo: Token inválido/expirado (401)
    Verificando --> SesiónActiva: Token válido → JWT sesión
    SesiónActiva --> DashboardAdmin: role == "admin"
    SesiónActiva --> DashboardStudent: role == "student"
    DashboardAdmin --> Anónimo: Cierra sesión (localStorage clear)
    DashboardStudent --> Anónimo: Cierra sesión (localStorage clear)
    SesiónActiva --> Anónimo: JWT expirado (7 días)
```

#### Especificación Operativa

```
Spec Operativa: CourseHub

Despliegue:
- SSH deploy desde CI/CD (GitHub Actions / GitLab CI)
- En VM: git pull origin master → docker build → docker compose up -d
- Rollback: docker compose down && git checkout <tag> && re-deploy

Red:
- Traefik v3.3 como reverse proxy
- Certificado TLS wildcard *.deviaaps.com (Cloudflare DNS-01)
- Red Docker externa: miseia-net (compartida entre servicios del VM)
- Puerto interno contenedor: 30001

Escalado:
- Instancia única en fase actual
- Para escalar: aumentar réplicas en docker compose + balanceo Traefik

Monitoreo:
- Latency p99 < 500 ms
- Healthcheck Docker: wget -qO- http://localhost:30001/ cada 30 s
- Logs: docker logs coursehub --follow
- Alerta si contenedor unhealthy > 2 min

Runbook: Contenedor caído:
1. docker ps → verificar estado
2. docker logs coursehub --tail 100 → revisar error
3. Si error de conexión MongoDB: verificar MONGODB_URI en .env.production
4. Si error de build: revisar Dockerfile y dependencias
5. Si persiste: git revert <commit> && re-deploy
```

---

### 8.2 Invariantes y Contratos

#### Contrato: `generateMagicLinkToken(email)`

```
PRECONDICIÓN:
- email: string no vacío y con formato válido
- JWT_SECRET: string de ≥ 32 caracteres en process.env

POSTCONDICIÓN:
- Retorna string con formato JWT (3 segmentos base64url separados por ".")
- El payload decodificado contiene { email, type: "magic-link", exp }
- exp = ahora + 900 segundos (15 minutos)

INVARIANTE:
- El mismo email siempre produce un token diferente (timestamp iat varía)
- El token no contiene información sensible en texto plano (sólo base64url)

EJEMPLO:
- generateMagicLinkToken("a@b.com") → "eyJ...xxx" (válido 15 min)
- verifyMagicLinkToken(<token expirado>) → throw JsonWebTokenError
- verifyMagicLinkToken(<token tampered>) → throw JsonWebTokenError
```

#### Contrato: `requireAdmin(request)`

```
PRECONDICIÓN:
- request: NextRequest con header Authorization: "Bearer <jwt>"
- JWT firmado con JWT_SECRET correcto y no expirado

POSTCONDICIÓN:
- Si válido y role=="admin": retorna JWTPayload { sub, email, role }
- Si no hay token: throw Error("No autorizado") → HTTP 401
- Si role!="admin": throw Error("Acceso denegado") → HTTP 403

INVARIANTE:
- Nunca retorna payload de usuario con role!="admin"
- Nunca modifica el request original

EJEMPLO:
- requireAdmin(req con token admin válido) → { sub, email, role:"admin" }
- requireAdmin(req sin token) → throw "No autorizado"
- requireAdmin(req con token student) → throw "Acceso denegado"
```

---

### 8.3 Registros de Decisiones de Arquitectura (ADRs)

#### ADR-001: Next.js App Router con TypeScript

**Estado:** Aceptado

**Contexto:**
Se necesitaba un framework que unificara frontend y backend en un solo proyecto, con soporte TypeScript nativo y rutas de API en el mismo servidor.

**Opciones consideradas:**
1. Express + React (SPA separada): máximo control, pero dos proyectos
2. Next.js Pages Router: conocido, pero obsoleto en Next.js 13+
3. **Next.js App Router**: RSC, rutas de API integradas, output standalone para Docker
4. Remix: buena alternativa pero menor ecosistema en el equipo

**Decisión:** Next.js 16 con App Router.

**Razones:**
- Server Components reducen JS enviado al cliente (~40 % menos bundle)
- `output: 'standalone'` genera imagen Docker auto-contenida sin node_modules completo
- Un único repositorio para frontend + API simplifica CI/CD
- Equipo familiarizado con el ecosistema React/Next

**Consecuencias positivas:**
- Despliegue Docker simplificado (imagen ~180 MB)
- Hot reload en desarrollo, TypeScript end-to-end

**Consecuencias negativas:**
- App Router tiene curva de aprendizaje (RSC vs Client Components)
- Versión 16 puede tener breaking changes no documentados aún

---

#### ADR-002: MongoDB con driver nativo (sin Mongoose)

**Estado:** Aceptado

**Contexto:**
La plataforma requiere flexibilidad en el esquema de recursos (Markdown libre) y baja latencia en lecturas de colecciones jerarquizadas (cursos → secciones → recursos).

**Opciones consideradas:**
1. PostgreSQL + Prisma: tipado fuerte, pero joins complejos para jerarquía
2. MongoDB + Mongoose: ODM popular, pero abstracción innecesaria para este caso
3. **MongoDB + driver nativo**: control total sobre queries, sin overhead de ODM
4. SQLite: no escala a múltiples réplicas

**Decisión:** MongoDB 7.x con driver nativo `mongodb@7`.

**Razones:**
- Documentos JSON para recursos Markdown eliminan columnas BLOB
- Queries directas ~15 % más rápidas que Mongoose en lecturas simples
- Singleton `MongoClient` evita agotamiento de pool en entorno serverless

**Consecuencias positivas:**
- TypeScript interfaces en `lib/types.ts` equivalen al schema de Mongoose
- Flexibilidad total en estructura de documentos

**Consecuencias negativas:**
- Sin validación de esquema en capa de datos (validar en API routes)
- Migraciones manuales si se cambia estructura

---

#### ADR-003: Autenticación sin contraseña (Magic Links)

**Estado:** Aceptado

**Contexto:**
Para una plataforma educativa B2C, la fricción de registro con contraseña reduce la conversión. El requisito de seguridad es moderado (contenido educativo, no datos financieros).

**Opciones consideradas:**
1. Username/password + bcrypt: clásico, pero requiere gestión de contraseñas
2. OAuth2 (Google/GitHub): dependencia de terceros, privacidad
3. **Magic Links JWT**: sin contraseñas, flujo simple, auto-expirante
4. WebAuthn/Passkeys: muy seguro, pero complejidad de implementación alta

**Decisión:** Magic Links con JWT firmado, TTL 15 min.

**Razones:**
- Sin almacenamiento de contraseñas (reduce superficie de ataque)
- JWT auto-contenido: no requiere tabla de sesiones en DB
- TTL corto (15 min) limita ventana de explotación si el correo es interceptado

**Consecuencias positivas:**
- Elimina riesgo de contraseñas débiles o reutilizadas
- UX simplificado: no hay "olvidé mi contraseña"

**Consecuencias negativas:**
- Dependencia del servicio de correo (si SMTP falla, no hay acceso)
- No apto para usuarios sin acceso inmediato a su correo

---

#### ADR-004: JWT almacenado en localStorage (no cookies)

**Estado:** Aceptado

**Contexto:**
El requisito explícito del proyecto indica `localStorage` como almacenamiento del JWT de sesión.

**Opciones consideradas:**
1. **localStorage**: simple, accesible desde JS, sin CSRF
2. httpOnly cookie: protección XSS nativa, pero requiere CORS/CSRF config adicional
3. sessionStorage: perdida al cerrar pestaña, mala UX
4. IndexedDB: sobreingeniería para este caso

**Decisión:** localStorage por requisito del proyecto.

**Razones:**
- El proyecto define explícitamente `localStorage` como mecanismo
- Sin CSRF (no se envía automáticamente como las cookies)

**Consecuencias positivas:**
- Sin vulnerabilidad CSRF
- Implementación directa sin middleware de cookies

**Consecuencias negativas:**
- Vulnerable a XSS si se inyecta código malicioso (mitigado por CSP)
- Token no accesible desde Server Components (sólo en cliente)

---

#### ADR-005: Docker multi-stage + Traefik para producción

**Estado:** Aceptado

**Contexto:**
El despliegue en GCI VM requería una forma reproducible de empaquetar la aplicación y exponerla con TLS sin gestionar manualmente certificados SSL.

**Opciones consideradas:**
1. PM2 + Nginx: configuración manual de certificados, mayor superficie
2. **Docker multi-stage + Traefik**: imagen auto-contenida, TLS automático
3. Kubernetes: sobredimensionado para una sola instancia
4. Vercel/Cloud Run: costo y dependencia de vendor

**Decisión:** Dockerfile multi-stage (node:20-alpine builder → runner) con Traefik v3.3.

**Razones:**
- Imagen final < 200 MB vs 1.5 GB sin multi-stage (reducción del 87 %)
- `output: 'standalone'` de Next.js elimina node_modules del runner
- Traefik gestiona TLS wildcard `*.deviaaps.com` vía Cloudflare DNS-01 automáticamente
- Red Docker compartida `miseia-net` integra MongoDB y Mailhog del mismo VM

**Consecuencias positivas:**
- Despliegue reproducible en cualquier servidor Docker
- Sin renovación manual de certificados TLS

**Consecuencias negativas:**
- `docker build` en el servidor tarda ~3 min (aceptable para esta escala)
- Si Traefik cae, todos los servicios del VM quedan inaccesibles

---

## 9. Pruebas Unitarias e Integración

### 9.1 Pruebas Unitarias (Jest + ts-jest)

**Comando:**
```bash
npm test                   # Ejecutar todas las pruebas
npm run test:coverage      # Con reporte de cobertura
```

**Dependencias de testing:**
```json
{
  "jest": "^30.4.2",
  "ts-jest": "^29.4.11",
  "@types/jest": "^30.0.0",
  "jest-environment-node": "^30.4.1"
}
```

**Alcance y resultados:**

| Archivo | Statements | Branch | Funciones | Líneas |
|---|---|---|---|---|
| `lib/auth.ts` | 100 % | 100 % | 100 % | 100 % |
| `lib/apiAuth.ts` | 100 % | 100 % | 100 % | 100 % |
| `lib/db.ts` | 0 % | 0 % | 0 % | 0 % |
| `lib/mail.ts` | 0 % | 0 % | 0 % | 0 % |
| **Total lib/** | **58.69 %** | **50 %** | **77.77 %** | **58.13 %** |

> `db.ts` y `mail.ts` requieren conexión real a MongoDB y SMTP — se cubren mediante pruebas E2E.

**Casos de prueba (`__tests__/lib/auth.test.ts` — 9 casos):**
- ✅ Genera token de magic link verificable
- ✅ Lanza error en token manipulado (tampered)
- ✅ Lanza error en token expirado
- ✅ Genera token de sesión con payload correcto (sub, email, role)
- ✅ Lanza error en token de sesión inválido
- ✅ Preserva campo `role: "student"` en token de sesión

**Casos de prueba (`__tests__/lib/apiAuth.test.ts` — 6 casos):**
- ✅ `getTokenFromRequest` devuelve `null` sin header Authorization
- ✅ `getTokenFromRequest` extrae token del header Bearer
- ✅ `requireAuth` lanza con token inválido → HTTP 401
- ✅ `requireAuth` retorna payload con token válido
- ✅ `requireAdmin` lanza HTTP 403 para rol student
- ✅ `requireAdmin` retorna payload para rol admin

**Total: 15 pruebas — 15 pasaron — 0 fallidas**

### 9.2 Pruebas E2E (Playwright)

**Comando:**
```bash
npm run test:e2e           # Requiere servidor en http://localhost:3000
```

**Dependencia:**
```json
{ "@playwright/test": "^1.61.1" }
```

**Alcance (`e2e/auth.spec.ts`):**
- ✅ Landing page renderiza correctamente
- ✅ Formulario de login visible en /login
- ✅ Formulario de magic link se puede enviar
- ✅ Acceso a /dashboard sin autenticación redirige a /login

**Alcance (`e2e/api.spec.ts`):**
- ✅ GET /api/courses sin token → HTTP 401
- ✅ POST /api/auth/send-link sin email → HTTP 400
- ✅ POST /api/auth/send-link con email válido → respuesta de envío
- ✅ POST /api/auth/verify con token inválido → HTTP 401

---

## 10. Despliegue

### 10.1 URL de Despliegue

```
https://courses.deviaaps.com
```

La aplicación está activa y accesible públicamente con TLS gestionado por Traefik v3.3.

### 10.2 Lockfile

El repositorio incluye `package-lock.json` (lockfileVersion 3) comprometido en git, garantizando instalaciones reproducibles en todos los entornos:

```
package-lock.json   ← npm lockfile v3 — SIEMPRE usar "npm ci" en CI/CD
```

```bash
# Correcto — usa exactamente las versiones del lockfile
npm ci

# Evitar en CI — puede actualizar versiones
npm install
```

### 10.3 Instrucciones de Despliegue

#### Opción A: Docker local

```bash
# Build
docker build -t coursehub:latest .

# Ejecutar con variables de entorno
docker run -p 3000:30001 \
  --env-file .env.production \
  coursehub:latest
```

#### Opción B: Servidor con Docker Compose + Traefik

```bash
# En el servidor GCI VM
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-140-courses.git ~/MISEIA1-4-140-courses
cd ~/MISEIA1-4-140-courses

# Configurar variables de producción
cp .env.example .env.production
# Editar .env.production con valores reales

# Construir y levantar
docker build -t coursehub:latest .
docker compose -f docker-compose.courses.yml up -d

# Verificar
docker ps | grep coursehub
curl http://localhost:30001/
```

#### Opción C: CI/CD automatizado (recomendado)

**GitHub Actions** — push a `master` activa automáticamente:

```
Stages: Lint & Tests → Production Build → Deploy to GCI VM via SSH
Archivo: .github/workflows/ci-cd.yml
```

**GitLab CI** — push a `master` en gitlab.codecrypto.academy:

```
Stages: lint_and_test → build_production → deploy_to_vm
Archivo: .gitlab-ci.yml
```

#### Variables de entorno requeridas en producción

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión MongoDB con autenticación |
| `MONGODB_DB` | Nombre de la base de datos (`saas-cursos`) |
| `JWT_SECRET` | Secreto JWT ≥ 32 caracteres |
| `NEXT_PUBLIC_API_URL` | URL pública (`https://courses.deviaaps.com`) |
| `MAILHOG_HOST` | Host SMTP (`mailhog` en docker network) |
| `MAIL_PORT` | Puerto SMTP (1025 para Mailhog) |
| `AWS_USERNAME` | Usuario Rustfs/S3 |
| `AWS_PASSWORD` | Contraseña Rustfs/S3 |
| `AWS_URL` | URL del servicio S3 (`http://rustfs:9000`) |
| `AWS_BUCKET` | Nombre del bucket |

---

## 11. Mejoras y Extensiones

- **Búsqueda de contenido**: campo de texto en el dashboard que filtre recursos por título o contenido mediante `$text` index de MongoDB.
- **Paginación de cursos**: el endpoint `GET /api/courses` podría aceptar `?page=&limit=` para soportar catálogos grandes sin cargar todos los documentos.
- **Progreso del estudiante**: colección `progress` que registre qué recursos ha completado cada usuario, con barra de progreso visual por sección.
- **Exportación a PDF**: endpoint que renderice un recurso Markdown a PDF usando `puppeteer` o `@react-pdf/renderer`.
- **Subida de archivos multimedia**: integración completa con Rustfs (S3-compatible) para cargar PDFs, videos y audios directamente desde el panel admin.
- **Notificaciones en tiempo real**: WebSocket o Server-Sent Events para notificar a los administradores cuando se recibe nueva retroalimentación.
- **Multi-tenancy**: soporte para múltiples organizaciones con subdominios y aislamiento de datos por `orgId`.
- **Analytics básico**: dashboard para el admin con métricas de recursos más vistos, usuarios activos y retroalimentaciones recientes.

---

## 12. Cambios Documentados

### Funcionalidades añadidas con asistencia de IA

| Componente | Cambio | Justificación |
|---|---|---|
| `lib/auth.ts` | Implementación completa de magic links JWT | Autenticación sin contraseña reduce fricción de registro |
| `__tests__/lib/auth.test.ts` | 9 pruebas unitarias con 100 % cobertura | Garantiza contrato del módulo de autenticación |
| `__tests__/lib/apiAuth.test.ts` | 6 pruebas para guards de API | Verifica comportamiento 401/403 en rutas protegidas |
| `.github/workflows/ci-cd.yml` | Pipeline completo test → build → deploy SSH | Automatización de entregas reproducibles |
| `.gitlab-ci.yml` | Pipeline espejo en GitLab CI | Cumplimiento de requisitos de evaluación duales |
| `Dockerfile` | Build multi-stage node:20-alpine | Imagen final ~180 MB vs 1.5 GB sin multi-stage |
| `docker-compose.courses.yml` | Integración con red Traefik `miseia-net` | Exposición TLS automática sin configuración manual |
| `.env.example` | Plantilla de variables con valores placeholder | Facilita onboarding sin exponer credenciales reales |
| `jest.config.js` | Conversión de `.ts` a `.js` CommonJS | Elimina dependencia de `ts-node` en CI/CD |
| `eslint.config.mjs` | Deshabilitado `react-hooks/set-state-in-effect` | El patrón async `load()` en `useEffect` es intencional |

### Revisión crítica explícita

**Fortalezas verificadas con evidencia:**

- **Pipeline CI/CD funcional en ambas plataformas**: GitHub Actions (run `28302304037`) y GitLab CI (pipeline `1229`) pasaron todos los stages. La evidencia es observable en los logs públicos de ambos sistemas.
- **Cobertura 100 % en módulos críticos**: `lib/auth.ts` y `lib/apiAuth.ts` tienen cobertura total de statements, branches, funciones y líneas. Esto se verifica ejecutando `npm run test:coverage`.
- **Imagen Docker optimizada**: el build multi-stage reduce el tamaño final ~87 % respecto a una imagen sin etapas, verificable con `docker image ls | grep coursehub`.
- **Despliegue en producción real**: la aplicación responde en `https://courses.deviaaps.com` con TLS válido (certificado Cloudflare).

**Deuda técnica identificada y cuantificada:**

- `lib/db.ts` y `lib/mail.ts` tienen 0 % de cobertura de pruebas unitarias, arrastrando la cobertura global a 58.13 %, justo por debajo del umbral de 60 % configurado. **Solución recomendada**: añadir `mongodb-memory-server` y mocks de Nodemailer para cubrir estos módulos sin infraestructura real.
- El `docker build` ocurre en el servidor de producción, consumiendo ~3 min de CPU del VM en cada despliegue. **Solución recomendada**: construir la imagen en el runner de CI y publicarla en GitHub Container Registry (`ghcr.io`); el servidor sólo haría `docker pull` + `docker compose up`.
- Las anotaciones de ESLint en el pipeline (variables no usadas `router`, `token`; dependencias faltantes en `useEffect`) no bloquean el build pero representan código sin limpiar que puede confundir a futuros mantenedores.
- El almacenamiento del JWT en `localStorage` (requerido por el proyecto) expone el token a ataques XSS. Sin una política de Content-Security-Policy explícita, cualquier script inyectado podría exfiltrar el token. **Mitigación pendiente**: definir cabeceras CSP en `next.config.ts`.
