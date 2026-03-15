"""Unit tests for auth.py — JWT and password hashing."""

from datetime import timedelta
from unittest.mock import MagicMock

import pytest
from jose import jwt

import auth
import models


class TestPasswordHashing:
    def test_hash_returns_bcrypt_format(self):
        h = auth.get_password_hash("mypassword")
        assert h.startswith("$2b$")

    def test_verify_correct_password(self):
        h = auth.get_password_hash("correct")
        assert auth.verify_password("correct", h) is True

    def test_verify_wrong_password(self):
        h = auth.get_password_hash("correct")
        assert auth.verify_password("wrong", h) is False


class TestCreateAccessToken:
    def test_contains_sub_claim(self):
        token = auth.create_access_token(data={"sub": "user@test.com"})
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        assert payload["sub"] == "user@test.com"

    def test_default_expiry_is_15_min(self):
        token = auth.create_access_token(data={"sub": "user@test.com"})
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        assert "exp" in payload

    def test_custom_expiry(self):
        token = auth.create_access_token(
            data={"sub": "user@test.com"},
            expires_delta=timedelta(minutes=60),
        )
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        assert "exp" in payload


class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_valid_token_returns_user(self, db_session, test_user):
        token = auth.create_access_token(data={"sub": test_user.email})
        user = await auth.get_current_user(token=token, db=db_session)
        assert user.email == test_user.email

    @pytest.mark.asyncio
    async def test_invalid_token_raises_401(self, db_session):
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            await auth.get_current_user(token="invalid.token.here", db=db_session)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_no_sub_claim_raises_401(self, db_session):
        from fastapi import HTTPException

        token = jwt.encode({"data": "no-sub"}, auth.SECRET_KEY, algorithm=auth.ALGORITHM)
        with pytest.raises(HTTPException) as exc_info:
            await auth.get_current_user(token=token, db=db_session)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_user_not_in_db_raises_401(self, db_session):
        from fastapi import HTTPException

        token = auth.create_access_token(data={"sub": "nonexistent@test.com"})
        with pytest.raises(HTTPException) as exc_info:
            await auth.get_current_user(token=token, db=db_session)
        assert exc_info.value.status_code == 401
