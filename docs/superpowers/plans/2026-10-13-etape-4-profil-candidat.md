# Étape 4 Lasry - Profil candidat - Plan d’implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Tasks use checkbox syntax for tracking.

**Goal:** Compléter le profil `/profile` afin qu’un candidat puisse modifier ses informations et gérer ses projets et expériences enregistrés dans PostgreSQL.

**Architecture:** Réutiliser les tables existantes et les réponses JSON usuelles du backend. Des routes dédiées filtrent toutes les requêtes par `req.session.userId`; la page Profil garde les trois sections dans des composants React simples. Une suppression déjà associée à une candidature est refusée pour conserver les relations.

**Tech Stack:** React, Tailwind CSS, Express, PostgreSQL, Swagger/OpenAPI.

**Spec:** `docs/superpowers/specs/2026-10-13-etape-4-profil-candidat.md`

## Global Constraints

- Ne jamais accepter `person_id` depuis le client pour déterminer le propriétaire.
- Conserver les rôles existants et ne jamais renvoyer `password_hash`.
- Réutiliser `people`, `projects`, `experiences`, `application_projects` et `application_experiences`; aucune migration prévue.
- Écrire des commentaires de code en anglais.
- Garder les messages utilisateur et l’interface en français.
- Utiliser des requêtes SQL paramétrées et des états de chargement, erreur, succès et liste vide.

## Review Focus

- ID d’un autre propriétaire injecté dans URL ou corps : aucune lecture ni modification intercompte.
- Adresse e-mail existante ou invalide : 409 ou 400, avec profil inchangé.
- URL invalide, champs vides, valeur trop longue ou dates inversées : 400 sans écriture partielle.
- Suppression d’un élément lié à une candidature : 409 sans effacer l’association.
- Session expirée pendant une requête : 401 et retour vers la connexion.

---

### Task 1: API de profil personnel

**Files:**
- Create: `backend/src/controllers/profile_controller.js`
- Create: `backend/src/routes/profile_routes.js`
- Modify: `backend/src/app.js`
- Modify: `backend/src/docs/api.js`
- Test: `backend/test/integration.test.js` (isolated test database only)

**Interfaces:**
- `GET /api/people/me` returns `id`, `first_name`, `last_name`, `email`, `phone`, `role` for the session account.
- `PATCH /api/people/me` accepts only `first_name`, `last_name`, `email`, `phone`; it returns the updated public account.

- [x] **Step 1: Add API cases to the existing integration suite** for unauthenticated access, successful GET/PATCH, forbidden fields, invalid values and duplicate email.
- [x] **Step 2: Run the focused API test** and confirm the new cases fail before implementation.
- [x] **Step 3: Implement session-owned GET/PATCH** with field allowlist, trimmed values, email format/uniqueness validation, parameterized SQL, and 400/401/409 responses.
- [x] **Step 4: Document both routes in Swagger** with cookie security, payload fields and errors.
- [x] **Step 5: Run the focused API test** and confirm it passes.

### Task 2: CRUD API des projets et expériences

**Files:**
- Create: `backend/src/controllers/projects_controller.js`
- Create: `backend/src/routes/projects_routes.js`
- Create: `backend/src/controllers/experiences_controller.js`
- Create: `backend/src/routes/experiences_routes.js`
- Modify: `backend/src/app.js`
- Modify: `backend/src/docs/api.js`
- Test: `backend/test/integration.test.js` (isolated test database only)

**Interfaces:**
- Collections: `GET/POST /api/projects` and `GET/POST /api/experiences`.
- Items: `PATCH/DELETE /api/projects/:id` and `PATCH/DELETE /api/experiences/:id`.
- JSON names mirror the SQL columns; ownership always comes from the session.

- [x] **Step 1: Add API cases to the existing integration suite** for each CRUD operation, required fields, bounds, URL/date validation, 401, cross-account IDs and associated-item deletion.
- [x] **Step 2: Run focused API tests** and confirm the new cases fail before implementation.
- [x] **Step 3: Implement projects CRUD** with title validation, optional HTTP(S) URLs, owner-scoped SQL and 409 for projects linked to applications.
- [x] **Step 4: Implement experiences CRUD** with company/title validation, optional valid dates, owner-scoped SQL and 409 for experiences linked to applications.
- [x] **Step 5: Document all routes in Swagger** including request/response fields and status codes.
- [x] **Step 6: Run focused API tests** and confirm all new cases pass.

### Task 3: Page Profil complète

**Files:**
- Modify: `frontend/src/pages/auth/ProfilePage.jsx`
- Create if useful: focused profile/project/experience form components beside `ProfilePage.jsx`.
- Modify only if needed: `frontend/src/styles/components.css`

**Interfaces:**
- Load account with `GET /api/people/me`; load projects and experiences from their collection routes.
- Use PATCH on existing records and POST for new ones; DELETE only after confirmation.

- [x] **Step 1: Implement the account section** with editable name, email and optional phone; exclude role/password fields.
- [x] **Step 2: Implement project forms and list** with title, description, project URL and repository URL.
- [x] **Step 3: Implement experience forms and list** with company, title, description and dates; allow an empty list.
- [x] **Step 4: Add clear loading, empty, error, success and deletion-conflict feedback.**
- [ ] **Step 5: Manually verify the three profile sections** in the running app; run ESLint and production build.

### Task 4: Validation intégrée

**Files:**
- Modify if needed: `backend/test/integration.test.js`

- [x] **Step 1:** Run the existing integration suite against a dedicated database whose name starts with `wtms_test_`; do not point it at development data.
- [x] **Step 2:** Run frontend lint and build.
- [x] **Step 3:** Generate the Swagger spec and confirm all five profile/project/experience paths are documented. Live HTTP access to the Docker-hosted Swagger endpoint was unavailable in this shell.
- [ ] **Step 4:** Verify the browser flow with two accounts: create/edit items, ensure cross-account IDs fail, and ensure linked-item deletion is refused.

---

## Self-review

- Spec coverage: account GET/PATCH, projects CRUD, experiences CRUD, session ownership, validation, relationship-preserving deletion, UI states, responsive/accessibility review, Swagger and focused verification are assigned above.
- Existing SQL tables and application associations are reused; no migration is included.
- Route names, methods, session ownership and error outcomes match the spec.
- The repository has no frontend test runner or component-test dependency; keep the implementation dependency-free and verify the page manually in the browser.
- The backend suite uses Node's built-in test runner and a dedicated PostgreSQL database guard; extend that suite rather than inventing a second test harness.
- End-to-end browser verification remains part of Task 4 because API tests alone do not prove the page persists data correctly.
