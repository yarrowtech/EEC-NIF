# Super Admin API Map

Base frontend pages:

- `http://localhost:5173/super-admin/overview`
- `http://localhost:5173/super-admin/requests`
- `http://localhost:5173/super-admin/feedback`
- `http://localhost:5173/super-admin/issues`
- `http://localhost:5173/super-admin/credentials`
- `http://localhost:5173/super-admin/id-pass`
- `http://localhost:5173/super-admin/operations`
- `http://localhost:5173/super-admin/active-schools`

## 1) Entry server + route mounts

Source:

- `backend/index.js`

Mounted APIs used by the pages above:

- `/api/schools`
- `/api/support`
- `/api/issues`
- `/api/admin/auth`
- `/api/super-admin` (used by Active Schools status update)

## 2) Auth + access control middleware

Source:

- `backend/middleware/adminAuth.js`

Super-admin gating is enforced in route files via `ensureSuperAdmin` where required.

## 3) Backend route handlers used by these pages

Sources:

- `backend/routes/schoolRoutes.js`
- `backend/routes/supportRoutes.js`
- `backend/routes/issueRoutes.js`
- `backend/routes/adminRoutes.js`
- `backend/routes/superAdminRoutes.js`

## 4) Global request correlation/logging

Source:

- `backend/middleware/requestLogger.js`

Tracks request start/end with request/trace IDs.

## 5) Structured logger implementation

Source:

- `backend/utils/logger.js`

Pino-based logger used by middleware/routes.

## 6) Database models used in these flows

Primary:

- `backend/models/School.js`
- `backend/models/SupportRequest.js`
- `backend/models/Issue.js`
- `backend/models/Admin.js`

## 7) API docs mapping reference

Sources:

- `backend/swagger.js`
- `backend/swagger-output.json`

## 8) Verification / attack simulation scripts currently in repo

Sources:

- `backend/scripts/productionSecurityAttackSuite.js`
- `backend/scripts/finalSchoolRegistrationSecuritySuite.js`

---

## Page-wise endpoint map

### O) `/super-admin/overview`

Directly used endpoints:

- `GET /api/schools/registrations/pending`
- `PUT /api/schools/registrations/:id/approve`
- `PUT /api/schools/registrations/:id/reject`
- `GET /api/support/requests`
- `GET /api/support/requests?supportType=feedback`
- `GET /api/support/requests?supportType=complaint`
- `PATCH /api/support/requests/:id`
- `GET /api/issues`
- `PATCH /api/issues/:id`
- `POST /api/admin/auth/profile`

### A) `/super-admin/requests`

Directly used endpoints:

- `GET /api/schools/registrations/pending`
- `DELETE /api/schools/registrations/pending?confirm=DELETE`
- `PUT /api/schools/registrations/:id/approve`
- `PUT /api/schools/registrations/:id/reject`
- `POST /api/admin/auth/school-admins`
- `POST /api/admin/auth/school-admins/notify-credentials`

### B) `/super-admin/feedback`

Directly used endpoints:

- `GET /api/support/requests?supportType=feedback`
- `PATCH /api/support/requests/:id`

### C) `/super-admin/issues`

Directly used endpoints:

- `GET /api/issues`
- `GET /api/support/requests?supportType=complaint`
- `PATCH /api/issues/:id`
- `PATCH /api/support/requests/:id` (when source type is complaint)

### D) `/super-admin/credentials`

Direct page calls:

- No extra page-specific API call.

Data source:

- Uses shared data already fetched by `SuperAdminApp` (requests/credentials state).

### E) `/super-admin/id-pass`

Direct page calls:

- No direct API call in current page component.

Data source:

- Uses profile/state passed from `SuperAdminApp`.

### F) `/super-admin/operations`

Directly used endpoints:

- `GET /api/support/settings`
- `PATCH /api/support/settings`

Current behavior note:

- Announcement/compliance/activity interactions are local UI state in current implementation.

### G) `/super-admin/active-schools`

Directly used endpoints:

- `GET /api/schools`
- `GET /api/admin/auth/school-admins`
- `PATCH /api/super-admin/schools/:id/status`

---

## Shared boot-time fetches from `SuperAdminApp`

When super-admin module loads, these shared calls are triggered and feed multiple pages:

- `POST /api/admin/auth/profile`
- `GET /api/schools/registrations/pending`
- `GET /api/schools`
- `GET /api/admin/auth/school-admins`
- `GET /api/support/requests?supportType=feedback`
- `GET /api/issues`
- `GET /api/support/requests?supportType=complaint`
- `GET /api/support/settings`
