# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Running Management App — upload TCX files from GPS watches, view activity summaries, lap-by-lap analysis, and charts. Built with React (Vite) frontend + FastAPI backend + SQLite.

## Common Commands

### Docker (full stack)
```bash
docker-compose up --build          # Build and run both services
# Frontend: http://localhost:3000  Backend: http://localhost:8000/docs
```

### Backend (local development)
```bash
cd backend
poetry install                     # Install dependencies
poetry run uvicorn main:app --reload  # Start dev server on :8000
```

### Frontend (local development)
```bash
cd frontend
fnm use 24.11.1                    # Set Node version
npm install                        # Install dependencies
npm run dev                        # Start Vite dev server on :5173
npm run build                      # Production build
npm run lint                       # ESLint
```

### Prerequisites
- Python 3.11.14 (pyenv), Poetry for backend
- Node 24.11.1 (fnm) for frontend
- Docker uses `requirements.txt` (not Poetry) and standard Node image (not fnm)

## Architecture

### Backend (`backend/`)

FastAPI app with two routers mounted in `main.py`:

| File | Purpose |
|------|---------|
| `main.py` | App init, CORS config, router registration, DB table creation |
| `database.py` | SQLAlchemy engine + session factory (SQLite at `./sql_app.db`) |
| `models.py` | ORM models: User → Activity → Lap (cascade deletes) |
| `schemas.py` | Pydantic request/response schemas |
| `auth.py` | JWT auth (HS256, 30min expiry), bcrypt password hashing, `get_current_user` dependency |
| `tcx_parser.py` | lxml-based TCX XML parser, extracts activity + lap metrics |
| `routers/users.py` | `POST /users/` (register), `POST /users/token` (login → JWT) |
| `routers/activities.py` | Upload TCX, list/get/delete activities (all authenticated) |

**Auth flow:** Login returns JWT → client sends `Authorization: Bearer {token}` → `get_current_user` dependency validates token and injects user. Secret key from `SECRET_KEY` env var.

**DB relationships:** User has many Activities, Activity has many Laps. All cascade on delete.

**TCX parsing:** Handles Garmin TrainingCenterDatabase v2 XML with ns3 extensions for RunCadence. Duplicate detection by `(user_id, start_time)` → 409 Conflict.

### Frontend (`frontend/`)

React 19 SPA using Vite, React Router v7, Axios, Recharts.

| File/Dir | Purpose |
|----------|---------|
| `src/main.jsx` | Entry point with BrowserRouter |
| `src/App.jsx` | Route definitions + PrivateRoute auth guard |
| `src/api.js` | Axios instance with token interceptor + 401 → `auth-error` event |
| `src/pages/Login.jsx` | Login form |
| `src/pages/Register.jsx` | Registration form |
| `src/pages/Dashboard.jsx` | Activity list, TCX upload (drag-and-drop), year/month filters |
| `src/pages/ActivityDetail.jsx` | Activity metrics, lap table, Recharts pace/HR chart |
| `src/components/Layout.jsx` | App shell with sidebar navigation |
| `src/components/ActivityCard.jsx` | Activity list item card |
| `src/components/AuthErrorModal.jsx` | Portal-based modal for session expiration |

**Auth flow:** Token stored in `localStorage('token')`. Axios request interceptor adds Bearer header. Response interceptor catches 401 → dispatches global `auth-error` event → modal clears token and redirects to login.

**Styling:** SB Admin 2 theme (Bootstrap) + CSS custom properties in `index.css`. Bootstrap loaded via CDN in `index.html`.

**API base URL:** Hardcoded to `http://localhost:8000` in `src/api.js`. In Docker, nginx serves frontend on port 80 (mapped to 3000).

**Time zones:** Dashboard converts UTC times to KST (+9 hours) for display.

### Docker Setup

- **Backend Dockerfile:** `python:3.11-slim`, installs from `requirements.txt`, runs uvicorn on :8000
- **Frontend Dockerfile:** Multi-stage — Node 24-alpine builds, nginx-alpine serves static files on :80
- **Nginx:** SPA routing via `try_files $uri $uri/ /index.html`

## Key Conventions

- Backend documentation and user-facing text are in Korean (한국어)
- CORS origins include `localhost:5173` (Vite dev) and `localhost:3000` (Docker)
- No centralized state management — local component state with React hooks
- Metrics units: distance in meters, time in seconds, pace in seconds/km
