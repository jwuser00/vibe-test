"""Unit tests for services/llm/models.py."""

from unittest.mock import patch

from services.llm import models as llm_models


class TestGetLlm:
    def test_low_tier_returns_anthropic(self, monkeypatch):
        monkeypatch.setattr(llm_models, "LLM_LOW_MODEL", "claude-haiku-4-5-20251001")
        llm = llm_models.get_llm("low")
        assert "Anthropic" in type(llm).__name__

    def test_high_tier_returns_anthropic(self, monkeypatch):
        monkeypatch.setattr(llm_models, "LLM_HIGH_MODEL", "claude-haiku-4-5-20251001")
        llm = llm_models.get_llm("high")
        assert "Anthropic" in type(llm).__name__

    def test_gpt_model_returns_openai(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-fake-key")
        monkeypatch.setattr(llm_models, "LLM_LOW_MODEL", "gpt-4o-mini")
        llm = llm_models.get_llm("low")
        assert "OpenAI" in type(llm).__name__

    def test_default_max_tokens_low(self, monkeypatch):
        monkeypatch.setattr(llm_models, "LLM_LOW_MODEL", "claude-haiku-4-5-20251001")
        llm = llm_models.get_llm("low")
        assert llm.max_tokens == 500

    def test_default_max_tokens_high(self, monkeypatch):
        monkeypatch.setattr(llm_models, "LLM_HIGH_MODEL", "claude-haiku-4-5-20251001")
        llm = llm_models.get_llm("high")
        assert llm.max_tokens == 2048

    def test_custom_max_tokens(self, monkeypatch):
        monkeypatch.setattr(llm_models, "LLM_LOW_MODEL", "claude-haiku-4-5-20251001")
        llm = llm_models.get_llm("low", max_tokens=1024)
        assert llm.max_tokens == 1024
