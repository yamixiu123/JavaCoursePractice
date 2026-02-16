# Repository Guidelines

## Project Structure & Module Organization
- Root pages: `index.html`, `problem.html`, `stats.html`, `login.html`, `admin.html`.
- Frontend source lives in `src/`:
  - `src/js/` for page logic and shared modules (`api.js`, `storage.js`, `judge.js`, `problems.js`).
  - `src/styles/` for page-specific and global CSS.
- Backend source lives in `server/`:
  - `server/index.js` (Express entry),
  - `server/routes/` (auth, students, progress),
  - `server/db.js` (SQLite init and admin bootstrap),
  - `server/auth.js` (JWT middleware/helpers).
- Utility scripts: `scripts/dev-all.cjs`.
- Build output: `dist/`. Static public assets: `public/`.

## Build, Test, and Development Commands
- `npm install`: install frontend + backend dependencies.
- `npm run dev`: start Vite frontend dev server (`http://localhost:5173`).
- `npm run dev:server`: start Express API server (`http://localhost:3000`).
- `npm run dev:all`: run frontend and backend together (recommended in development).
- `npm run build`: production build to `dist/`.
- `npm run preview`: preview the built frontend locally.

## Coding Style & Naming Conventions
- Use 4-space indentation and semicolons in JS files (match existing codebase).
- Keep modules small and focused; prefer named exports for shared utilities.
- File naming:
  - Page modules/styles: kebab-case (for example `problem-list.js`, `problem-list.css`).
  - Route files: resource-based names (`auth.js`, `students.js`).
- Prefer clear constants for limits/validation rules (see `server/routes/progress.js`).

## Testing Guidelines
- No automated test suite is configured yet.
- For each change, run at minimum:
  1. `npm run build`
  2. Manual smoke checks for `/api/health`, login, submit flow, and admin student actions.
- If you add tests, place them near the related module (or under a top-level `tests/`) and document run commands in `package.json`.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style used in history, for example: `chore: initial project import and setup`.
- Recommended format: `type(scope): short summary` (`feat`, `fix`, `chore`, `docs`, `refactor`).
- PRs should include:
  - clear problem/solution summary,
  - impacted paths (for example `server/routes/progress.js`),
  - manual verification steps,
  - screenshots for UI changes (`index`, `problem`, `stats`, `admin`, `login`).

## Security & Configuration Tips
- Never commit real secrets. Configure via environment variables:
  - `JWT_SECRET`, `JAVAOJ_ADMIN_PASSWORD`, `JAVAOJ_DB_PATH`, `CORS_ORIGIN`.
- In production, ensure `JWT_SECRET` and admin password are explicitly set.
