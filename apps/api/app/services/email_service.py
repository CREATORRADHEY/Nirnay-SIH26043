import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import get_settings


class EmailAdapter:
    def send_email(self, recipient: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
        raise NotImplementedError


class ConsoleEmailAdapter(EmailAdapter):
    """Development / Testing Email Adapter.
    Logs email payload to stdout/console.
    """
    def send_email(self, recipient: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
        print(f"\n=== [DEV EMAIL ADAPTER] ===")
        print(f"To: {recipient}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body_text}")
        print(f"============================\n")
        return True


class SMTPEmailAdapter(EmailAdapter):
    """Production Provider-Neutral SMTP Email Adapter."""
    def __init__(self, host: str, port: int, username: Optional[str], password: Optional[str], from_email: str, use_tls: bool = True):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.from_email = from_email
        self.use_tls = use_tls

    def send_email(self, recipient: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.from_email
        msg["To"] = recipient

        msg.attach(MIMEText(body_text, "plain"))
        if body_html:
            msg.attach(MIMEText(body_html, "html"))

        try:
            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                if self.use_tls:
                    server.starttls()
                if self.username and self.password:
                    server.login(self.username, self.password)
                server.sendmail(self.from_email, [recipient], msg.as_string())
            return True
        except Exception as e:
            print(f"[SMTP ERROR] Failed to deliver email to {recipient}: {str(e)}")
            return False


class EmailService:
    def __init__(self, adapter: Optional[EmailAdapter] = None):
        self.adapter = adapter or self._get_default_adapter()

    def _get_default_adapter(self) -> EmailAdapter:
        settings = get_settings()
        provider = getattr(settings, "email_provider", "console").lower()
        if provider == "smtp":
            return SMTPEmailAdapter(
                host=getattr(settings, "smtp_host", "localhost"),
                port=int(getattr(settings, "smtp_port", 587)),
                username=getattr(settings, "smtp_username", None),
                password=getattr(settings, "smtp_password", None),
                from_email=getattr(settings, "smtp_from_email", "noreply@nirnay.gov.in"),
            )
        return ConsoleEmailAdapter()

    def send_verification_email(self, recipient: str, verify_url: str) -> bool:
        subject = "NIRNAY Platform - Email Address Verification"
        body = f"""Welcome to NIRNAY (Societal Innovation Collaboration & Readiness Platform).

Please click the link below to verify your email address:
{verify_url}

This verification link will expire in 24 hours.
If you did not create an account on NIRNAY, please ignore this email.
"""
        return self.adapter.send_email(recipient, subject, body)

    def send_password_reset_email(self, recipient: str, reset_url: str) -> bool:
        subject = "NIRNAY Platform - Password Reset Request"
        body = f"""A password reset request was initiated for your NIRNAY account.

Please click the link below to choose a new password:
{reset_url}

This link is valid for 1 hour. If you did not request a password reset, please secure your account immediately.
"""
        return self.adapter.send_email(recipient, subject, body)

    def send_org_invite_email(self, recipient: str, org_name: str, invite_url: str) -> bool:
        subject = f"NIRNAY Platform - Invitation to join {org_name}"
        body = f"""You have been invited to join '{org_name}' on the NIRNAY Platform.

Click the link below to accept your invitation:
{invite_url}

If you do not recognize this institution, please contact platform administration.
"""
        return self.adapter.send_email(recipient, subject, body)


email_service = EmailService()
