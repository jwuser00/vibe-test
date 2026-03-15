"""Unit tests for email_service.py."""

from unittest.mock import patch, MagicMock

import email_service


class TestIsSmtpConfigured:
    def test_all_set(self, monkeypatch):
        monkeypatch.setattr(email_service, "SMTP_HOST", "smtp.test.com")
        monkeypatch.setattr(email_service, "SMTP_USERNAME", "user")
        monkeypatch.setattr(email_service, "SMTP_PASSWORD", "pass")
        monkeypatch.setattr(email_service, "SMTP_FROM_EMAIL", "a@b.com")
        assert email_service._is_smtp_configured() is True

    def test_partial_returns_false(self, monkeypatch):
        monkeypatch.setattr(email_service, "SMTP_HOST", "smtp.test.com")
        monkeypatch.setattr(email_service, "SMTP_USERNAME", "")
        monkeypatch.setattr(email_service, "SMTP_PASSWORD", "pass")
        monkeypatch.setattr(email_service, "SMTP_FROM_EMAIL", "a@b.com")
        assert email_service._is_smtp_configured() is False


class TestSendPasswordResetEmail:
    def test_smtp_not_configured_skips(self, monkeypatch):
        monkeypatch.setattr(email_service, "SMTP_HOST", "")
        # Should not raise
        email_service.send_password_reset_email("user@test.com", "token123")

    def test_smtp_configured_calls_sendmail(self, monkeypatch):
        monkeypatch.setattr(email_service, "SMTP_HOST", "smtp.test.com")
        monkeypatch.setattr(email_service, "SMTP_PORT", 587)
        monkeypatch.setattr(email_service, "SMTP_USERNAME", "user")
        monkeypatch.setattr(email_service, "SMTP_PASSWORD", "pass")
        monkeypatch.setattr(email_service, "SMTP_FROM_EMAIL", "from@test.com")
        monkeypatch.setattr(email_service, "FRONTEND_URL", "http://localhost:3000")

        mock_smtp_instance = MagicMock()
        mock_smtp_cls = MagicMock(return_value=mock_smtp_instance)
        mock_smtp_instance.__enter__ = MagicMock(return_value=mock_smtp_instance)
        mock_smtp_instance.__exit__ = MagicMock(return_value=False)

        with patch("email_service.smtplib.SMTP", mock_smtp_cls):
            email_service.send_password_reset_email("user@test.com", "token123")

        mock_smtp_instance.sendmail.assert_called_once()
        args = mock_smtp_instance.sendmail.call_args
        assert args[0][0] == "from@test.com"
        assert args[0][1] == ["user@test.com"]

    def test_email_body_contains_reset_link(self, monkeypatch):
        from email import message_from_string

        monkeypatch.setattr(email_service, "SMTP_HOST", "smtp.test.com")
        monkeypatch.setattr(email_service, "SMTP_PORT", 587)
        monkeypatch.setattr(email_service, "SMTP_USERNAME", "user")
        monkeypatch.setattr(email_service, "SMTP_PASSWORD", "pass")
        monkeypatch.setattr(email_service, "SMTP_FROM_EMAIL", "from@test.com")
        monkeypatch.setattr(email_service, "FRONTEND_URL", "http://localhost:3000")

        mock_smtp_instance = MagicMock()
        mock_smtp_cls = MagicMock(return_value=mock_smtp_instance)
        mock_smtp_instance.__enter__ = MagicMock(return_value=mock_smtp_instance)
        mock_smtp_instance.__exit__ = MagicMock(return_value=False)

        with patch("email_service.smtplib.SMTP", mock_smtp_cls):
            email_service.send_password_reset_email("user@test.com", "mytoken")

        raw = mock_smtp_instance.sendmail.call_args[0][2]
        msg = message_from_string(raw)
        # Walk MIME parts and decode the HTML body
        body_text = ""
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                body_text = part.get_payload(decode=True).decode("utf-8")
        assert "http://localhost:3000/reset-password?token=mytoken" in body_text
