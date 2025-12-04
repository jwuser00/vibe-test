# Running Management App

This is a Running Management Application built with React, FastAPI, SQLite, and Docker.

## Features
- **User Authentication**: Sign up and Login.
- **TCX Upload**: Upload your running data (TCX files).
- **Dashboard**: View a list of your activities with summary stats.
- **Activity Detail**: Analyze your run with detailed metrics (Distance, Time, Pace, HR, Cadence) and lap data.
- **Visualization**: Interactive charts for Pace and Heart Rate.

## Prerequisites
- Docker and Docker Compose installed on your machine.
- 로컬 실행 시:
  - Node 24.11.1 (fnm으로 설치)
  - Python 3.11.14 (pyenv로 지정), Poetry 설치

## How to Run

1. Open your terminal and navigate to the project directory.

2. Run the following command to build and start the application:
   ```bash
   docker-compose up --build
   ```

3. Once the containers are running, open your browser and go to:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 로컬 개발
1. `fnm use 24.11.1` (또는 `fnm install 24.11.1 && fnm use 24.11.1`)
2. 프론트엔드: `cd frontend && npm install && npm run dev`
3. 백엔드: `cd backend && poetry install && poetry run uvicorn main:app --reload`

## Usage
1. Go to [http://localhost:3000](http://localhost:3000).
2. Click "Register" to create a new account.
3. Login with your credentials.
4. On the Dashboard, click "Upload TCX" to upload a `.tcx` file.
5. Click on an activity card to view detailed analysis.

## Tech Stack
- **Frontend**: React (Vite), Recharts, Lucide React, Vanilla CSS (Premium Design).
- **Backend**: FastAPI, SQLAlchemy, Pydantic, lxml (TCX parsing).
- **Database**: SQLite.
- **Infrastructure**: Docker, Nginx.
