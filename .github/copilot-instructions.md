# Copilot Instructions — Civic Issue Reporting 🏙️

Purpose
- Short, actionable guidance for AI coding agents to be immediately productive in this repo.

Big picture (what runs where)
- Single Express backend (backend/server.js) serves the static frontend and the REST API.
  - Static front-end files: `frontend/` (served via `express.static` in `server.js`).
  - Uploaded images: served from `/uploads` (top-level `uploads/` folder).  
- Database: MongoDB at `mongodb://127.0.0.1:27017/civic_issues` (hard-coded in `server.js`).

API surface (quick reference)
- POST `/signup` — body: { name, email, password } → 400 if user exists, 200 on success.
- POST `/login` — body: { email, password } → returns `{ email, role }` on success (no token).
- POST `/report` — multipart/form-data; field `image` for file; other form fields: title, description, location, category, email.
  - Uses `multer` to store file in top-level `uploads/`, filename stored in DB.
- GET `/my-issues?email=<email>` — returns array of issues for that email.
- DELETE `/issue/:id` — deletes issue by id.
- GET `/gov/issues` — returns all issues.
- PUT `/gov/issue/:id` — body: `{ status, comment }` updates status and saves `comment`.

Frontend / integration patterns (examples to follow)
- `frontend/main.html` — submits `FormData` to `/report` (see `issueForm` submit handler).
- `frontend/my-issues.html` — calls `/my-issues?email=...` and `DELETE /issue/:id`; displays `/uploads/<filename>` images.
- `frontend/government/gov-dashboard.html` — GET `/gov/issues` and PUT `/gov/issue/:id` with `{ status, comment }`.

Project-specific conventions & pitfalls
- Authentication is intentionally minimal: frontend stores only `email` in `localStorage` (no JWT, no password hashing). Agents should NOT assume secure auth is present—add guards when implementing secure features.
- Unprotected pages: gov dashboard is accessible without a session check — if adding auth, update both client-side checks and server-side route protection.
- Duplicate/incomplete model files: `backend/models/` exists but `server.js` defines schemas inline and the model files are inconsistent (e.g., `Issue.js` lacks a proper export). Prefer a single source of truth — either refactor to use `models/` or keep inline schemas, and update both.
- Responses: frontend expects plain JSON and conventional HTTP success codes. Match existing shapes to avoid breaking UI (e.g., `/login` returns `{ email, role }`).

Developer workflows & commands
- Start backend: in `backend/`: `npm start` (runs `node server.js`).
- Requires a running local MongoDB instance at `127.0.0.1:27017`.
- No build step: frontend is static HTML/CSS/JS served by Express.

Testing & debugging notes
- There are no existing automated tests. Add tests under `backend/test/` if you introduce business logic.
- For server errors: check console logs for `MongoDB connected` and server startup message `Server running on http://localhost:3000`.
- Check `uploads/` for stored images after report submissions.

Quick PR checklist for agents
1. Ensure API changes keep backward-compatible response shapes (see examples above).  
2. If adding auth, implement server-side checks and update frontend flows (login redirect + `localStorage` usage).  
3. If modifying models, either refactor `server.js` to import `backend/models/*` or update `models/*` and import them — do not leave duplicates.  
4. Add small integration test(s) for critical paths (signup/login/report → GET `/my-issues`).

Where to look first (file map)
- Backend entry & routes: `backend/server.js` 🔧
- Optional model files: `backend/models/Issue.js`, `backend/models/User.js` ⚠️ (incomplete)
- Frontend examples: `frontend/main.html`, `frontend/my-issues.html`, `frontend/government/gov-dashboard.html`

If anything here is unclear or you want the agent to follow stricter rules (e.g., require tests for every change, enforce auth before merging), tell me which areas to tighten and I’ll iterate. ✅
