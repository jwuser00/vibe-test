"""Endpoint tests for /plans/* — CRUD and sessions."""

from datetime import date

import pytest

import models
from tests.fixtures.sample_data import make_user, make_plan, make_plan_session


class TestCreatePlan:
    def test_success(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.post("/plans/", json={
            "user_prompt": "이번 주 러닝 계획 세워줘",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_prompt"] == "이번 주 러닝 계획 세워줘"
        assert data["generation_status"] == "pending"
        assert data["session_count"] == 0


class TestListPlans:
    def test_list(self, authenticated_client, db_session, test_user):
        make_plan(db_session, test_user, user_prompt="Plan 1")
        make_plan(db_session, test_user, user_prompt="Plan 2")

        resp = authenticated_client.get("/plans/")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_ordered_by_created_at_desc(self, authenticated_client, db_session, test_user):
        make_plan(db_session, test_user, user_prompt="Old")
        make_plan(db_session, test_user, user_prompt="New")

        resp = authenticated_client.get("/plans/")
        data = resp.json()
        assert data[0]["user_prompt"] == "New"

    def test_includes_session_count(self, authenticated_client, db_session, test_user):
        plan = make_plan(db_session, test_user)
        make_plan_session(db_session, plan, session_date=date(2024, 1, 15))
        make_plan_session(db_session, plan, session_date=date(2024, 1, 16))

        resp = authenticated_client.get("/plans/")
        assert resp.json()[0]["session_count"] == 2


class TestActivePlan:
    def test_returns_active(self, authenticated_client, db_session, test_user):
        plan = make_plan(db_session, test_user, status=models.PlanStatus.active)
        make_plan_session(db_session, plan, session_date=date(2024, 1, 15))

        resp = authenticated_client.get("/plans/active")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == plan.id
        assert len(data["sessions"]) == 1

    def test_no_active_plan(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/plans/active")
        assert resp.status_code == 200
        assert resp.json() is None


class TestPlanDetail:
    def test_get_plan(self, authenticated_client, db_session, test_user):
        plan = make_plan(db_session, test_user)
        make_plan_session(db_session, plan)

        resp = authenticated_client.get(f"/plans/{plan.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_prompt"] == plan.user_prompt
        assert len(data["sessions"]) == 1

    def test_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/plans/99999")
        assert resp.status_code == 404

    def test_other_user(self, authenticated_client, db_session, test_user):
        other = make_user(db_session, email="planother@test.com")
        plan = make_plan(db_session, other)
        resp = authenticated_client.get(f"/plans/{plan.id}")
        assert resp.status_code == 404


class TestDeletePlan:
    def test_success(self, authenticated_client, db_session, test_user):
        plan = make_plan(db_session, test_user)
        make_plan_session(db_session, plan)

        resp = authenticated_client.delete(f"/plans/{plan.id}")
        assert resp.status_code == 200
        assert db_session.query(models.Plan).get(plan.id) is None

    def test_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.delete("/plans/99999")
        assert resp.status_code == 404


class TestPlanSessions:
    def test_get_sessions(self, authenticated_client, db_session, test_user):
        plan = make_plan(db_session, test_user)
        make_plan_session(db_session, plan, session_date=date(2024, 1, 15), title="Day 1")
        make_plan_session(db_session, plan, session_date=date(2024, 1, 16), title="Day 2")

        resp = authenticated_client.get(f"/plans/{plan.id}/sessions")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/plans/99999/sessions")
        assert resp.status_code == 404
