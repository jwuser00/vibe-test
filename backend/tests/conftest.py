"""Shared test fixtures.

Uses SQLite in-memory DB and builds a test FastAPI app from routers directly,
bypassing main.py (which runs MySQL-specific migrations at import time).
"""

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from fastapi import FastAPI
from fastapi.testclient import TestClient

from database import Base, get_db
import auth
import models
from tests.fixtures.sample_data import make_user


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def test_engine():
    """SQLite in-memory engine for the entire test session."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
    )
    # Enable foreign key enforcement for SQLite
    @event.listens_for(engine, "connect")
    def _set_fk_pragma(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return engine


@pytest.fixture(scope="session")
def tables(test_engine):
    """Create all tables once per session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db_session(test_engine, tables):
    """Per-test DB session wrapped in a transaction that rolls back after the test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


# ---------------------------------------------------------------------------
# FastAPI test app + client fixtures
# ---------------------------------------------------------------------------

def _create_test_app() -> FastAPI:
    """Create a FastAPI app with all routers mounted (no main.py import)."""
    from routers import users, activities, races, dashboard, plans

    app = FastAPI(title="Running Manager Test")
    app.include_router(users.router)
    app.include_router(activities.router)
    app.include_router(races.router)
    app.include_router(dashboard.router)
    app.include_router(plans.router)
    return app


@pytest.fixture()
def test_app(db_session):
    """FastAPI app with get_db overridden to use the test session."""
    app = _create_test_app()
    app.dependency_overrides[get_db] = lambda: db_session
    yield app
    app.dependency_overrides.clear()


@pytest.fixture()
def client(test_app):
    """Unauthenticated test client."""
    return TestClient(test_app)


# ---------------------------------------------------------------------------
# Auth fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def test_user(db_session):
    """A persisted test user with known credentials."""
    return make_user(db_session)


@pytest.fixture()
def auth_token(test_user):
    """JWT token for test_user."""
    return auth.create_access_token(data={"sub": test_user.email})


@pytest.fixture()
def authenticated_client(test_app, auth_token):
    """Test client with Authorization header pre-set."""
    client = TestClient(test_app)
    client.headers["Authorization"] = f"Bearer {auth_token}"
    return client


# ---------------------------------------------------------------------------
# Background task mocks (autouse)
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _mock_background_tasks(monkeypatch):
    """Prevent real LLM calls from BackgroundTasks during endpoint tests."""
    monkeypatch.setattr("routers.activities.evaluate_activity", lambda x: None)
    monkeypatch.setattr("routers.races.evaluate_activity", lambda x: None)
    monkeypatch.setattr("routers.plans.generate_plan", lambda x: None)


@pytest.fixture(autouse=True)
def _mock_email_service(monkeypatch):
    """Prevent real SMTP calls by making SMTP appear unconfigured."""
    import email_service
    monkeypatch.setattr(email_service, "SMTP_HOST", "")
