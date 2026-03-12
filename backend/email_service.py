"""OCI Email Delivery SMTP service for transactional emails."""

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _is_smtp_configured() -> bool:
    return all([SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL])


def send_password_reset_email(to_email: str, reset_token: str) -> None:
    """비밀번호 재설정 이메일을 전송합니다.

    Args:
        to_email: 수신자 이메일 주소
        reset_token: 비밀번호 재설정 토큰

    Returns:
        None. SMTP 설정이 없으면 경고만 기록하고 종료합니다.
    """
    if not _is_smtp_configured():
        logger.warning(
            "SMTP가 설정되지 않아 비밀번호 재설정 이메일을 전송하지 않습니다. "
            "SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL 환경 변수를 확인하세요."
        )
        return

    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    html_body = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>비밀번호 재설정</title>
</head>
<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2>비밀번호 재설정 요청</h2>
  <p>아래 링크를 클릭하면 비밀번호를 재설정할 수 있습니다.<br>
  링크는 <strong>30분</strong> 후 만료됩니다.</p>
  <p style="margin: 32px 0;">
    <a href="{reset_link}"
       style="background-color: #4e73df; color: white; padding: 12px 24px;
              text-decoration: none; border-radius: 4px; display: inline-block;">
      비밀번호 재설정
    </a>
  </p>
  <p style="color: #888; font-size: 13px;">
    이 이메일을 요청하지 않으셨다면 무시하시면 됩니다.<br>
    링크를 직접 입력하려면: {reset_link}
  </p>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "[러닝 매니저] 비밀번호 재설정 링크"
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, [to_email], msg.as_string())
        logger.info("비밀번호 재설정 이메일 전송 완료: %s", to_email)
    except smtplib.SMTPException as exc:
        logger.error("비밀번호 재설정 이메일 전송 실패 (%s): %s", to_email, exc)
