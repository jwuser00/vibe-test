"""Endpoint tests for /users/* — registration, login, profile, password."""

from datetime import datetime, timedelta

import pytest

import models
from tests.fixtures.sample_data import make_user


class TestRegister:
    def test_success(self, client, db_session):
        resp = client.post("/users/", json={
            "email": "new@test.com",
            "password": "TestPass123!",
            "nickname": "New",
            "birth_year": 1995,
            "birth_month": 6,
            "gender": "남성",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "new@test.com"
        assert data["nickname"] == "New"

    def test_duplicate_email(self, client, db_session, test_user):
        resp = client.post("/users/", json={
            "email": test_user.email,
            "password": "TestPass123!",
            "nickname": "Dup",
            "birth_year": 1995,
            "birth_month": 6,
            "gender": "남성",
        })
        assert resp.status_code == 400

    def test_missing_fields(self, client):
        resp = client.post("/users/", json={"email": "a@b.com"})
        assert resp.status_code == 422


class TestLogin:
    def test_success(self, client, db_session, test_user):
        resp = client.post("/users/token", data={
            "username": test_user.email,
            "password": "TestPass123!",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_wrong_password(self, client, db_session, test_user):
        resp = client.post("/users/token", data={
            "username": test_user.email,
            "password": "WrongPass!",
        })
        assert resp.status_code == 401

    def test_nonexistent_user(self, client, db_session):
        resp = client.post("/users/token", data={
            "username": "nobody@test.com",
            "password": "TestPass123!",
        })
        assert resp.status_code == 401

    def test_google_only_account_no_password(self, client, db_session):
        make_user(db_session, email="google@test.com", password=None, google_id="g123")
        resp = client.post("/users/token", data={
            "username": "google@test.com",
            "password": "whatever",
        })
        assert resp.status_code == 401


class TestProfile:
    def test_get_profile(self, authenticated_client, test_user):
        resp = authenticated_client.get("/users/me")
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == test_user.email
        assert data["has_password"] is True

    def test_unauthenticated(self, client):
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_update_profile(self, authenticated_client, test_user):
        resp = authenticated_client.put("/users/me", json={
            "nickname": "Updated",
            "birth_year": 1985,
            "birth_month": 12,
            "gender": "여성",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["nickname"] == "Updated"
        assert data["birth_year"] == 1985


class TestChangePassword:
    def test_success(self, authenticated_client, test_user):
        resp = authenticated_client.put("/users/me/password", json={
            "current_password": "TestPass123!",
            "new_password": "NewPass456!",
        })
        assert resp.status_code == 200

    def test_wrong_current_password(self, authenticated_client, test_user):
        resp = authenticated_client.put("/users/me/password", json={
            "current_password": "WrongCurrent!",
            "new_password": "NewPass456!",
        })
        assert resp.status_code == 400

    def test_google_only_account(self, db_session, test_app):
        from fastapi.testclient import TestClient
        import auth

        user = make_user(db_session, email="gonly@test.com", password=None, google_id="g456")
        token = auth.create_access_token(data={"sub": user.email})
        client = TestClient(test_app)
        client.headers["Authorization"] = f"Bearer {token}"

        resp = client.put("/users/me/password", json={
            "current_password": "anything",
            "new_password": "NewPass456!",
        })
        assert resp.status_code == 400


class TestForgotResetPassword:
    def test_forgot_existing_email(self, client, db_session, test_user):
        resp = client.post("/users/forgot-password", json={"email": test_user.email})
        assert resp.status_code == 200
        # Token should be created in DB
        token = db_session.query(models.PasswordResetToken).filter(
            models.PasswordResetToken.user_id == test_user.id
        ).first()
        assert token is not None

    def test_forgot_nonexistent_email(self, client, db_session):
        resp = client.post("/users/forgot-password", json={"email": "nobody@test.com"})
        assert resp.status_code == 200  # Same response to prevent email enumeration

    def test_reset_valid_token(self, client, db_session, test_user):
        db_token = models.PasswordResetToken(
            user_id=test_user.id,
            token="validtoken123",
            expires_at=datetime.utcnow() + timedelta(minutes=30),
            used=False,
        )
        db_session.add(db_token)
        db_session.commit()

        resp = client.post("/users/reset-password", json={
            "token": "validtoken123",
            "new_password": "ResetPass789!",
        })
        assert resp.status_code == 200

        db_session.refresh(db_token)
        assert db_token.used is True

    def test_reset_expired_token(self, client, db_session, test_user):
        db_token = models.PasswordResetToken(
            user_id=test_user.id,
            token="expiredtoken",
            expires_at=datetime.utcnow() - timedelta(minutes=1),
            used=False,
        )
        db_session.add(db_token)
        db_session.commit()

        resp = client.post("/users/reset-password", json={
            "token": "expiredtoken",
            "new_password": "NewPass!",
        })
        assert resp.status_code == 400

    def test_reset_already_used_token(self, client, db_session, test_user):
        db_token = models.PasswordResetToken(
            user_id=test_user.id,
            token="usedtoken",
            expires_at=datetime.utcnow() + timedelta(minutes=30),
            used=True,
        )
        db_session.add(db_token)
        db_session.commit()

        resp = client.post("/users/reset-password", json={
            "token": "usedtoken",
            "new_password": "NewPass!",
        })
        assert resp.status_code == 400

    def test_reset_invalid_token(self, client, db_session):
        resp = client.post("/users/reset-password", json={
            "token": "doesnotexist",
            "new_password": "NewPass!",
        })
        assert resp.status_code == 400


class TestGoogleOAuth:
    def test_google_login_not_configured(self, client, monkeypatch):
        monkeypatch.setattr("routers.users.GOOGLE_CLIENT_ID", "")
        resp = client.get("/users/auth/google", follow_redirects=False)
        assert resp.status_code == 503

    def test_google_login_redirect(self, client, monkeypatch):
        monkeypatch.setattr("routers.users.GOOGLE_CLIENT_ID", "test-client-id")
        resp = client.get("/users/auth/google", follow_redirects=False)
        assert resp.status_code == 307
        assert "accounts.google.com" in resp.headers["location"]
