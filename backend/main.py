import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from database import engine, Base
from routers import users, activities, races, dashboard

Base.metadata.create_all(bind=engine)

# Migrate: add actual_time column if races table exists but column doesn't
inspector = inspect(engine)
if "races" in inspector.get_table_names():
    columns = [c["name"] for c in inspector.get_columns("races")]
    if "actual_time" not in columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE races ADD COLUMN actual_time FLOAT"))
            conn.commit()

os.makedirs("uploads/races", exist_ok=True)

app = FastAPI(title="Running Manager")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(activities.router)
app.include_router(races.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Running Manager API"}
