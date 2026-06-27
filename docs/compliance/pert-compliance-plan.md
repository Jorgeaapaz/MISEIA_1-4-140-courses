# PERT Compliance Plan — CourseHub SaaS Platform
**Project:** MISEIA 1-4-140-courses  
**Date:** 2026-06-27  
**Student:** jorgeaapaz@hotmail.com

---

## PERT Compliance Plan

Logical ordered list to resolve all non-compliant items. Tasks with no dependencies can run in parallel (same level). Dependencies are noted per task.

### Level 1 — No dependencies (start immediately)

1. **ENV-001** Create `.env.example` template  
   - Prompt: [`001_env_example_fn_prompt.md`](./001_env_example_fn_prompt.md)  
   - Fixes: `dc_env_example`, `cq_sin_secretos_en_repo`

2. **DOC-001** Add architecture diagram to README  
   - Prompt: [`006_architecture_diagram_fn_prompt.md`](./006_architecture_diagram_fn_prompt.md)  
   - Fixes: `dc_diagrama_arquitectura`

3. **TEST-001** Implement Jest unit tests for `lib/` functions  
   - Prompt: [`002_tests_unit_e2e_fn_prompt.md`](./002_tests_unit_e2e_fn_prompt.md)  
   - Fixes: `cq_tests_minimos`, `cq_cobertura_alta` (partial)

### Level 2 — Depends on Level 1

4. **TEST-002** Implement Playwright E2E tests for critical flows  
   - Depends on: **TEST-001** (shared Jest config setup, test infrastructure)  
   - Prompt: [`002_tests_unit_e2e_fn_prompt.md`](./002_tests_unit_e2e_fn_prompt.md)  
   - Fixes: `cq_tests_minimos`, `fn_deploy_publico_accesible` (prereq for CI)

5. **DEPLOY-001** Create `env.production` + Dockerfile + docker-compose for GCI VM  
   - Depends on: **ENV-001** (env var list must be finalized first)  
   - Prompt: [`005_deploy_docker_fn_prompt.md`](./005_deploy_docker_fn_prompt.md)  
   - Fixes: `dc_instrucciones_deploy`, `fn_persistencia_efectiva`, `fn_deploy_publico_accesible` (partial)

### Level 3 — Depends on Level 2

6. **CI-001** GitHub Actions CI/CD pipeline (preferred path)  
   - Depends on: **TEST-001**, **TEST-002**, **DEPLOY-001**, **ENV-001**  
   - Prompt: [`003_ci_github_fn_prompt.md`](./003_ci_github_fn_prompt.md)  
   - Fixes: `cq_ci_funcional`, `fn_deploy_publico_accesible`

7. **CI-002** GitLab CI pipeline (parallel alternative)  
   - Depends on: **TEST-001**, **TEST-002**, **DEPLOY-001**, **ENV-001**  
   - Prompt: [`004_ci_gitlab_fn_prompt.md`](./004_ci_gitlab_fn_prompt.md)  
   - Fixes: `cq_ci_funcional` (alternative)

---

## Execution PERT

Numbered list of all tasks in execution order (per PERT dependency analysis):

| Order | Task ID | Task Name | Depends On | Prompt File | Issues Fixed |
|---|---|---|---|---|---|
| 1 | ENV-001 | Create `.env.example` template | — | `001_env_example_fn_prompt.md` | `dc_env_example`, `cq_sin_secretos_en_repo` |
| 2 | DOC-001 | Add architecture diagram (Mermaid) | — | `006_architecture_diagram_fn_prompt.md` | `dc_diagrama_arquitectura` |
| 3 | TEST-001 | Implement Jest unit tests for `lib/` | — | `002_tests_unit_e2e_fn_prompt.md` | `cq_tests_minimos` (partial) |
| 4 | TEST-002 | Implement Playwright E2E tests | TEST-001 | `002_tests_unit_e2e_fn_prompt.md` | `cq_tests_minimos`, `cq_cobertura_alta` |
| 5 | DEPLOY-001 | Dockerfile + docker-compose + `env.production` | ENV-001 | `005_deploy_docker_fn_prompt.md` | `dc_instrucciones_deploy`, `fn_persistencia_efectiva` |
| 6 | CI-001 | GitHub Actions CI/CD pipeline | TEST-001, TEST-002, DEPLOY-001 | `003_ci_github_fn_prompt.md` | `cq_ci_funcional`, `fn_deploy_publico_accesible` |
| 7 | CI-002 | GitLab CI pipeline | TEST-001, TEST-002, DEPLOY-001 | `004_ci_gitlab_fn_prompt.md` | `cq_ci_funcional` (alternative) |

**Critical Path:** ENV-001 → DEPLOY-001 → CI-001 (GitHub, preferred)  
**Parallel Quick Wins:** DOC-001 and TEST-001 can start immediately alongside ENV-001.
