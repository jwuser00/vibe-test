"""Endpoint tests for /activities/* — upload, list, detail, delete."""

from datetime import datetime, timedelta

import pytest

import models
from tests.fixtures.sample_tcx import make_tcx
from tests.fixtures.sample_data import make_user, make_activity, make_plan, make_plan_session


class TestUploadTcx:
    def test_success(self, authenticated_client, db_session, test_user):
        tcx = make_tcx()
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("test.tcx", tcx, "application/xml")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["total_distance"] == 1000

    def test_stores_lightweight_tcx(self, authenticated_client, db_session, test_user):
        tcx = make_tcx()
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("test.tcx", tcx, "application/xml")},
        )
        activity_id = resp.json()[0]["id"]
        activity = db_session.query(models.Activity).get(activity_id)
        assert activity.tcx_data is not None

    def test_detects_treadmill(self, authenticated_client, db_session, test_user):
        tcx = make_tcx(has_position=False)
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("treadmill.tcx", tcx, "application/xml")},
        )
        assert resp.json()[0]["is_treadmill"] is True

    def test_detects_outdoor(self, authenticated_client, db_session, test_user):
        tcx = make_tcx(has_position=True)
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("outdoor.tcx", tcx, "application/xml")},
        )
        assert resp.json()[0]["is_treadmill"] is False

    def test_sets_pending_evaluation(self, authenticated_client, db_session, test_user):
        tcx = make_tcx()
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("test.tcx", tcx, "application/xml")},
        )
        assert resp.json()[0]["llm_evaluation_status"] == "pending"

    def test_duplicate_409(self, authenticated_client, db_session, test_user):
        tcx = make_tcx(start_time="2024-06-01T08:00:00.000Z")
        # First upload
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("test.tcx", tcx, "application/xml")},
        )
        assert resp.status_code == 200
        # Second upload — same start_time
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("test.tcx", tcx, "application/xml")},
        )
        assert resp.status_code == 409

    def test_invalid_file(self, authenticated_client):
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("bad.tcx", b"not xml", "application/xml")},
        )
        assert resp.status_code == 400

    def test_unauthenticated(self, client):
        resp = client.post(
            "/activities/upload",
            files={"file": ("test.tcx", b"<xml/>", "application/xml")},
        )
        assert resp.status_code == 401

    def test_with_plan_session_id(self, authenticated_client, db_session, test_user):
        plan = make_plan(db_session, test_user)
        session = make_plan_session(db_session, plan)

        tcx = make_tcx(start_time="2024-07-01T08:00:00.000Z")
        resp = authenticated_client.post(
            "/activities/upload",
            files={"file": ("test.tcx", tcx, "application/xml")},
            data={"plan_session_id": str(session.id)},
        )
        assert resp.status_code == 200
        assert resp.json()[0]["plan_session_id"] == session.id


class TestListActivities:
    def test_empty(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/activities/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_own_only(self, authenticated_client, db_session, test_user):
        make_activity(db_session, test_user, start_time=datetime(2024, 1, 15, 10, 0))
        other = make_user(db_session, email="other@test.com")
        make_activity(db_session, other, start_time=datetime(2024, 1, 16, 10, 0))

        resp = authenticated_client.get("/activities/")
        data = resp.json()
        assert len(data) == 1

    def test_pagination(self, authenticated_client, db_session, test_user):
        for i in range(5):
            make_activity(db_session, test_user, start_time=datetime(2024, 1, 10 + i, 10, 0))

        resp = authenticated_client.get("/activities/?skip=2&limit=2")
        assert len(resp.json()) == 2


class TestActivityDetail:
    def test_with_laps(self, authenticated_client, db_session, test_user):
        tcx = make_tcx(laps=[
            {"distance": 1000, "time": 300, "hr": 150, "max_hr": 165, "cadence": 88},
        ])
        import tcx_parser
        lightweight = tcx_parser.create_lightweight_tcx(tcx)
        activity = make_activity(db_session, test_user, tcx_data=lightweight)

        resp = authenticated_client.get(f"/activities/{activity.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["laps"]) == 1

    def test_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/activities/99999")
        assert resp.status_code == 404

    def test_other_users_activity(self, authenticated_client, db_session, test_user):
        other = make_user(db_session, email="other2@test.com")
        activity = make_activity(db_session, other, start_time=datetime(2024, 2, 1, 10, 0))
        resp = authenticated_client.get(f"/activities/{activity.id}")
        assert resp.status_code == 404

    def test_no_tcx_data_empty_laps(self, authenticated_client, db_session, test_user):
        activity = make_activity(db_session, test_user, tcx_data=None)
        resp = authenticated_client.get(f"/activities/{activity.id}")
        assert resp.status_code == 200
        assert resp.json()["laps"] == []


class TestReEvaluate:
    def test_success(self, authenticated_client, db_session, test_user):
        activity = make_activity(
            db_session, test_user,
            llm_evaluation="old",
            llm_evaluation_status=models.LLMEvaluationStatus.completed,
        )
        resp = authenticated_client.post(f"/activities/{activity.id}/evaluate")
        assert resp.status_code == 200

        db_session.refresh(activity)
        assert activity.llm_evaluation is None
        assert activity.llm_evaluation_status == models.LLMEvaluationStatus.pending

    def test_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.post("/activities/99999/evaluate")
        assert resp.status_code == 404


class TestDeleteActivity:
    def test_success(self, authenticated_client, db_session, test_user):
        activity = make_activity(db_session, test_user)
        resp = authenticated_client.delete(f"/activities/{activity.id}")
        assert resp.status_code == 200

        deleted = db_session.query(models.Activity).get(activity.id)
        assert deleted is None

    def test_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.delete("/activities/99999")
        assert resp.status_code == 404

    def test_other_users_activity(self, authenticated_client, db_session, test_user):
        other = make_user(db_session, email="other3@test.com")
        activity = make_activity(db_session, other, start_time=datetime(2024, 3, 1, 10, 0))
        resp = authenticated_client.delete(f"/activities/{activity.id}")
        assert resp.status_code == 404
