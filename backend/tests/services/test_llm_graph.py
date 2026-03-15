"""Unit tests for services/llm/graph.py — formatting helpers and evaluation pipeline."""

from datetime import datetime, date
from unittest.mock import MagicMock, patch

import pytest

from services.llm.graph import (
    _format_time,
    _format_pace,
    _format_activity_summary,
    _format_plan_session,
    _build_prompt,
    evaluate_activity,
)
import models
from tests.fixtures.sample_data import make_user, make_activity, make_plan, make_plan_session


class _NoCloseSession:
    """Wrapper that delegates to a real session but makes close() a no-op."""

    def __init__(self, session):
        self._session = session

    def __getattr__(self, name):
        return getattr(self._session, name)

    def close(self):
        pass


class TestFormatTime:
    def test_hours(self):
        assert _format_time(3661) == "1:01:01"

    def test_minutes(self):
        assert _format_time(325) == "5:25"

    def test_zero(self):
        assert _format_time(0) == "0:00"


class TestFormatPace:
    def test_normal(self):
        assert _format_pace(330) == "5:30"

    def test_exact_minute(self):
        assert _format_pace(360) == "6:00"


class TestFormatActivitySummary:
    def test_contains_km_pace_hr(self):
        activity = MagicMock()
        activity.total_distance = 5000
        activity.total_time = 1500
        activity.avg_pace = 300
        activity.avg_hr = 150
        activity.avg_cadence = 88
        result = _format_activity_summary(activity)
        assert "5.00km" in result
        assert "5:00/km" in result
        assert "150bpm" in result
        assert "88spm" in result

    def test_no_hr_shows_dash(self):
        activity = MagicMock()
        activity.total_distance = 3000
        activity.total_time = 900
        activity.avg_pace = 300
        activity.avg_hr = None
        activity.avg_cadence = None
        result = _format_activity_summary(activity)
        assert "-bpm" in result
        assert "-spm" in result


class TestFormatPlanSession:
    def test_with_all_fields(self):
        session = MagicMock()
        session.session_type = models.SessionType.Easy
        session.title = "이지 런"
        session.description = "가볍게 뛰기"
        session.target_distance = 5000
        session.target_pace = 360
        result = _format_plan_session(session)
        assert "Easy" in result
        assert "이지 런" in result
        assert "5.0km" in result
        assert "6:00/km" in result

    def test_without_optional_fields(self):
        session = MagicMock()
        session.session_type = models.SessionType.Rest
        session.title = "휴식"
        session.description = None
        session.target_distance = None
        session.target_pace = None
        result = _format_plan_session(session)
        assert "Rest" in result
        assert "휴식" in result


class TestBuildPrompt:
    def test_renders_with_all_fields(self):
        activity = MagicMock()
        activity.total_distance = 5000
        activity.total_time = 1500
        activity.avg_pace = 300
        activity.avg_hr = 150
        activity.avg_cadence = 88
        activity.is_treadmill = False

        recent = MagicMock()
        recent.total_distance = 3000
        recent.total_time = 900
        recent.avg_pace = 300
        recent.avg_hr = 145
        recent.avg_cadence = 86

        user = MagicMock()
        user.gender = "남성"
        user.birth_year = 1990
        user.birth_month = 5

        result = _build_prompt(activity, [recent], user)
        assert "5.00" in result
        assert "남성" in result

    def test_renders_without_recent_or_plan(self):
        activity = MagicMock()
        activity.total_distance = 5000
        activity.total_time = 1500
        activity.avg_pace = 300
        activity.avg_hr = None
        activity.avg_cadence = None
        activity.is_treadmill = True

        user = MagicMock()
        user.gender = None
        user.birth_year = None
        user.birth_month = None

        result = _build_prompt(activity, [], user, plan_session=None)
        assert "없음" in result
        assert "트레드밀" in result


class TestEvaluateActivity:
    def test_success(self, db_session, test_user):
        activity = make_activity(
            db_session, test_user,
            llm_evaluation_status=models.LLMEvaluationStatus.pending,
        )

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(content="좋은 러닝이었습니다.")
        wrapper = _NoCloseSession(db_session)

        with (
            patch("services.llm.graph.SessionLocal", return_value=wrapper),
            patch("services.llm.graph.get_llm", return_value=mock_llm),
        ):
            evaluate_activity(activity.id)

        db_session.refresh(activity)
        assert activity.llm_evaluation == "좋은 러닝이었습니다."
        assert activity.llm_evaluation_status == models.LLMEvaluationStatus.completed

    def test_not_found_returns_silently(self, db_session):
        wrapper = _NoCloseSession(db_session)
        with patch("services.llm.graph.SessionLocal", return_value=wrapper):
            evaluate_activity(99999)  # Should not raise

    def test_llm_failure_sets_failed(self, db_session, test_user):
        activity = make_activity(
            db_session, test_user,
            llm_evaluation_status=models.LLMEvaluationStatus.pending,
        )

        mock_llm = MagicMock()
        mock_llm.invoke.side_effect = RuntimeError("LLM error")
        wrapper = _NoCloseSession(db_session)

        with (
            patch("services.llm.graph.SessionLocal", return_value=wrapper),
            patch("services.llm.graph.get_llm", return_value=mock_llm),
        ):
            evaluate_activity(activity.id)

        db_session.refresh(activity)
        assert activity.llm_evaluation_status == models.LLMEvaluationStatus.failed
