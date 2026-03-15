"""Unit tests for services/llm/prompts.py."""

import pytest
from services.llm.prompts import load_prompt


class TestLoadPrompt:
    def test_load_evaluation(self):
        text = load_prompt("evaluation")
        assert len(text) > 0
        assert "{distance_km}" in text

    def test_load_plan(self):
        text = load_prompt("plan")
        assert len(text) > 0
        assert "{user_prompt}" in text

    def test_load_nonexistent_raises(self):
        with pytest.raises(FileNotFoundError):
            load_prompt("nonexistent_prompt")
