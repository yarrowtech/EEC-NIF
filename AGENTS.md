# Repository Guidelines

## Project Structure & Module Organization
- `frontend/` hosts the Vite/React client; organize domains under `src/features/*`, share UI through `src/components/*`, place mocks/tests in sibling `__mocks__` and `__tests__`, and keep static assets in `public/`.
- `backend/` provides the Express + Mongoose API; requests flow `routes → controllers → models`, while shared middleware lives in `middleware/`, schedulers/utilities in `utils/`, logs under `logs/`, and Jest suites inside `backend/__tests__`.
- Documentation and helper scripts (`docs/`, `MANUAL_TESTING_COMMANDS.md`, `TRY_THESE_COMMANDS.md`, `scripts/`) describe manual flows and deployment steps—sync updates there whenever behavior changes.

## Build, Test, and Development Commands
- Frontend: `cd frontend && npm install`, then `npm run dev` (Vite server), `npm run build` (writes `dist/`), `npm run lint`, `npm test`, and `npm run test:coverage`.
- Backend: `cd backend && npm install`, then `npm run dev` (nodemon), `npm start`, `npm test`, `npm run test:coverage`, `npm run swagger:gen` for OpenAPI output, and `npm run security:suite` before staging.

## Coding Style & Naming Conventions
- Backend code sticks to 2-space indentation, CommonJS modules, and descriptive filenames mirroring their exports (`attendanceRoutes.js`, `tokenReplayTelemetry.js`). Route logging should pass through `utils/logger.js`.
- React files follow ESLint settings in `frontend/eslint.config.js`: modern ECMAScript, safe Hooks, and no unused vars unless UPPER_SNAKE_CASE constants. Components/hooks use PascalCase (`TeacherDashboard`) and camelCase (`usePresenceSocket`).

## Testing Guidelines
- Jest is configured in both apps (`frontend/jest.config.js`, `backend/jest.config.js`). Frontend suites belong in `src/**/__tests__` and should assert user behavior with Testing Library; backend suites in `backend/__tests__` typically wrap API calls with Supertest.
- Apply the Arrange-Act-Assert approach from `TESTING_GUIDE.md`, maintain 70–80% coverage via `npm run test:coverage`, and extend manual checklists whenever automation cannot cover a workflow.

## Commit & Pull Request Guidelines
- Commit history favors short, imperative subjects (`added test cases on the parents portal`, `FIX super admin issues`). Keep each commit scoped and mention the touched area in the subject; multi-surface work should include a short body.
- Pull requests must summarize intent, link the task/issue, list local commands run, and attach screenshots or API samples for UI or schema tweaks. Call out new `.env` keys (e.g., `SUPER_ADMIN_USERNAME`, `MONGODB_URI`) for reviewer setup.

## Security & Configuration Tips
- Backend bootstraps with `dotenv`; keep secrets for MongoDB, JWT, Socket.IO, Cloudinary, and seeding credentials in an untracked `.env`. Sanitize fixtures and store uploads under `backend/uploads/`.
- Run `npm run security:suite`, monitor `logs/` or `utils/securityEventLogger`, and rely on the provided telemetry middleware to maintain auditable trails.
