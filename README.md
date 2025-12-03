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

## How to Run

1. Open your terminal and navigate to the project directory.

2. Run the following command to build and start the application:
   ```bash
   docker-compose up --build
   ```

3. Once the containers are running, open your browser and go to:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

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
