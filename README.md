# FeedPulse
FeedPulse is a lightweight internal tool that lets teams collect product feedback and feature requests from users, then uses Google Gemini AI to automatically categorise, prioritise, and summarise them -- giving product teams instant clarity on what to build next.

## Testing
- Automated tests are not yet checked in. Until they exist, run a quick smoke pass before releasing:
  - Backend: start the API with your usual command (for example `npm run start` or `node dist/server.js`), hit a simple endpoint (health/root) to confirm 200s, then create a sample feedback item and verify the response includes the AI-generated category/summary.
  - Frontend: start the web app (for example `npm run dev`), submit a new feedback entry through the UI, confirm it appears in the list, and check that prioritisation/summaries render without errors.
- When you add automated suites later, standardise on `npm test` in each package so CI/CD can run them consistently.
AI-powered product feedback collector and triage dashboard. The public form collects issues/ideas, the backend scores and summarises them with Google Gemini, and the admin UI helps product teams prioritise fast.

## Features
- Public feedback form with validation (title, description, category, optional contact).
- Automatic AI analysis: category, sentiment, priority score (1-10), tags, and short summary per item.
- Admin login with JWT, rate-limited auth endpoints, and seeded default admin account.
- Dashboard: stats tiles, weekly AI digest, searchable/filterable feedback table, status updates, delete & re-run AI analysis.
- API health check and helpful error responses with consistent success/error envelope.

## Tech Stack
- Frontend: Next.js (App Router), React 19, Tailwind CSS 4, lucide-react, Sonner.
- Backend: Node.js + Express, TypeScript, MongoDB/Mongoose, JWT auth, bcrypt, Google Gemini API.
- Tooling: ts-node-dev for dev, Jest + Supertest for API tests, ESLint/TypeScript configs included.

## Monorepo Layout
- `frontend/` � Next.js client (public form, admin dashboard).
- `backend/` � REST API and AI integration services.
- `patch-*.js` � small patch helpers used during setup.

## Prerequisites
- Node.js 20+ and npm
- MongoDB connection string
- Google Gemini API key

## Backend Setup (`/backend`)
1) Create `.env` (example values):
```
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/feedpulse
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=change_me
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@feedpulse.com
ADMIN_PASSWORD=Admin@123
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=5
FRONTEND_URL=http://localhost:3000
```
2) Install deps: `npm install`
3) (Optional) Seed admin user: `npm run seed`
4) Start dev API: `npm run dev` (listens on port 4000)
5) Build/serve for prod: `npm run build` then `npm start`

Key endpoints
- `POST /api/feedback` (public) submit feedback
- `GET /api/feedback/stats` � dashboard stats (auth)
- `GET /api/feedback/summary` � weekly AI digest (auth)
- `GET /api/feedback` � list with pagination/filter/sort (auth)
- `PATCH /api/feedback/:id` � update status (auth)
- `POST /api/feedback/:id/reanalyze` � rerun AI (auth)
- `DELETE /api/feedback/:id` � delete (auth)
- `POST /api/auth/login` � returns JWT; use `Authorization: Bearer <token>`
- `GET /health` � service health check

## Frontend Setup (`/frontend`)
1) Create `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
2) Install deps: `npm install`
3) Run dev server: `npm run dev` (defaults to http://localhost:3000)
4) Build/serve: `npm run build` then `npm start`

## Development Tips
- Start API before the Next.js app so the client can reach `NEXT_PUBLIC_API_URL`.
- Rate limits protect auth + public submissions; adjust in backend `.env` if needed.
- Tests: `cd backend && npm test` or `npm run test:coverage`.
- Default admin credentials come from `.env`; change them for anything beyond local dev.

## Status
MVP-ready for local use; tighten secrets, logging, and deployment configs before production.
