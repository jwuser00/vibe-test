"""Unit tests for services/llm/plan_graph.py — JSON parsing and plan generation."""

import json
from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from services.llm.plan_graph import _parse_response_node, generate_plan
import models
from tests.fixtures.sample_data import make_user, make_plan


class _NoCloseSession:
    """Wrapper that delegates to a real session but makes close() a no-op."""

    def __init__(self, session):
        self._session = session

    def __getattr__(self, name):
        return getattr(self._session, name)

    def close(self):
        pass  # prevent test session from being closed


class TestParseResponseNode:
    def _make_state(self, raw_response):
        return {
            "plan_id": 1,
            "user_id": 1,
            "prompt": "",
            "raw_response": raw_response,
            "plan_text": "",
            "sessions": [],
        }

    def test_valid_json(self):
        data = {
            "plan_text": "이번 주 계획",
            "sessions": [
                {"date": "2024-01-15", "session_type": "Easy", "title": "이지 런"}
            ],
        }
        state = self._make_state(json.dumps(data))
        result = _parse_response_node(state)
        assert result["plan_text"] == "이번 주 계획"
        assert len(result["sessions"]) == 1

    def test_json_in_code_block(self):
        data = {"plan_text": "계획", "sessions": []}
        raw = f"```json\n{json.dumps(data)}\n```"
        result = _parse_response_node(self._make_state(raw))
        assert result["plan_text"] == "계획"

    def test_json_in_plain_code_block(self):
        data = {"plan_text": "계획", "sessions": []}
        raw = f"```\n{json.dumps(data)}\n```"
        result = _parse_response_node(self._make_state(raw))
        assert result["plan_text"] == "계획"

    def test_fallback_brace_extraction(self):
        raw = 'Some text before {"plan_text": "fallback", "sessions": []} and after'
        result = _parse_response_node(self._make_state(raw))
        assert result["plan_text"] == "fallback"

    def test_no_json_returns_raw(self):
        raw = "This is just plain text without any JSON"
        result = _parse_response_node(self._make_state(raw))
        assert result["plan_text"] == raw
        assert result["sessions"] == []

    def test_invalid_session_type_defaults_to_easy(self):
        data = {
            "plan_text": "계획",
            "sessions": [
                {"date": "2024-01-15", "session_type": "InvalidType", "title": "Test"}
            ],
        }
        result = _parse_response_node(self._make_state(json.dumps(data)))
        assert result["sessions"][0]["session_type"] == "Easy"

    def test_list_content_type(self):
        data = {"plan_text": "리스트 응답", "sessions": []}
        raw = [{"type": "text", "text": json.dumps(data)}]
        result = _parse_response_node(self._make_state(raw))
        assert result["plan_text"] == "리스트 응답"

    def test_non_string_non_list_returns_str(self):
        result = _parse_response_node(self._make_state(12345))
        assert result["plan_text"] == "12345"
        assert result["sessions"] == []


class TestGeneratePlan:
    def test_success_creates_sessions(self, db_session, test_user):
        plan = make_plan(
            db_session, test_user,
            generation_status=models.LLMEvaluationStatus.pending,
            llm_plan_text=None,
        )

        llm_response = json.dumps({
            "plan_text": "생성된 계획",
            "sessions": [
                {"date": "2024-01-15", "session_type": "Easy", "title": "이지 런",
                 "description": "5km", "target_distance": 5000, "target_pace": 360},
                {"date": "2024-01-16", "session_type": "Rest", "title": "휴식"},
            ],
        })

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(content=llm_response)
        wrapper = _NoCloseSession(db_session)

        with (
            patch("services.llm.plan_graph.SessionLocal", return_value=wrapper),
            patch("services.llm.plan_graph.get_llm", return_value=mock_llm),
        ):
            generate_plan(plan.id)

        db_session.refresh(plan)
        assert plan.llm_plan_text == "생성된 계획"
        assert plan.generation_status == models.LLMEvaluationStatus.completed
        assert plan.start_date == date(2024, 1, 15)
        assert plan.end_date == date(2024, 1, 16)
        assert len(plan.sessions) == 2

    def test_not_found_returns_silently(self, db_session):
        wrapper = _NoCloseSession(db_session)
        with patch("services.llm.plan_graph.SessionLocal", return_value=wrapper):
            generate_plan(99999)

    def test_llm_failure_sets_failed(self, db_session, test_user):
        plan = make_plan(
            db_session, test_user,
            generation_status=models.LLMEvaluationStatus.pending,
        )

        mock_llm = MagicMock()
        mock_llm.invoke.side_effect = RuntimeError("LLM error")
        wrapper = _NoCloseSession(db_session)

        with (
            patch("services.llm.plan_graph.SessionLocal", return_value=wrapper),
            patch("services.llm.plan_graph.get_llm", return_value=mock_llm),
        ):
            generate_plan(plan.id)

        db_session.refresh(plan)
        assert plan.generation_status == models.LLMEvaluationStatus.failed
