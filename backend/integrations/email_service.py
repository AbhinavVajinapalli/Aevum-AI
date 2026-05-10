"""
Email service integration (SMTP) skeleton for Aevum AI
Provides a simple `EmailService` class with `send_email` method.
This uses configuration from `config.py` and supports TLS/SSL.
"""
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

from config import config


class EmailService:
    """Simple SMTP email sender used by the backend.

    Usage:
        svc = EmailService()
        svc.send_email(to_address, subject, body, html=False)
    """

    def __init__(self):
        # Match names used in backend/config.py
        self.smtp_host = config.SMTP_SERVER
        self.smtp_port = config.SMTP_PORT
        # Trim whitespace from credentials and provide sensible fallbacks
        self.smtp_user = (config.SMTP_USERNAME or "").strip()
        self.smtp_pass = (config.SMTP_PASSWORD or "").strip()
        # Fallback to DEFAULT_ACCOUNT_EMAIL if SMTP_USERNAME not set
        if not self.smtp_user:
            self.smtp_user = (getattr(config, 'DEFAULT_ACCOUNT_EMAIL', '') or '').strip()

        # Keep the raw email for SMTP envelope sending and a formatted header for recipients.
        self.from_email = self.smtp_user or config.TEAM_EMAIL or ''

        # If port 465, prefer SSL; otherwise use STARTTLS
        self.use_tls = True if self.smtp_port != 465 else False

        # Use EMAIL_FROM_NAME + username if available
        self.from_address = f"{config.EMAIL_FROM_NAME} <{self.from_email}>" if self.from_email else config.EMAIL_FROM_NAME
        
        # Log initialization for debugging
        print(f"[EmailService] Initialized: host={self.smtp_host}, port={self.smtp_port}, user={self.smtp_user[:15] if self.smtp_user else 'EMPTY'}, pass_set={bool(self.smtp_pass)}, use_tls={self.use_tls}")

    def send_email(self, to_address: str, subject: str, body: str, html: bool = False) -> bool:
        """Send an email via SMTP. Returns True on success, False otherwise."""
        try:
            # Debug: log SMTP config at send time
            print(f"[SMTP Debug] Host: {self.smtp_host}, Port: {self.smtp_port}, User: {self.smtp_user[:20] if self.smtp_user else 'EMPTY'}, Pass set: {bool(self.smtp_pass)}, TLS: {self.use_tls}")
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_address
            msg['To'] = to_address

            part = MIMEText(body, 'html' if html else 'plain')
            msg.attach(part)

            if self.use_tls:
                print(f"[SMTP Debug] Connecting with STARTTLS to {self.smtp_host}:{self.smtp_port}...")
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10)
                server.ehlo()
                server.starttls()
                server.ehlo()
            else:
                print(f"[SMTP Debug] Connecting with SSL to {self.smtp_host}:{self.smtp_port}...")
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=10)

            if self.smtp_user and self.smtp_pass:
                print(f"[SMTP Debug] Logging in as {self.smtp_user[:20]}...")
                server.login(self.smtp_user, self.smtp_pass)
            elif self.smtp_pass and not self.smtp_user:
                print(f"[SMTP Debug] Logging in with from_email and password...")
                server.login(self.from_email or self.from_address, self.smtp_pass)
            else:
                print(f"[SMTP Debug] WARNING: No credentials provided (user: {bool(self.smtp_user)}, pass: {bool(self.smtp_pass)})")

            print(f"[SMTP Debug] Sending email to {to_address}...")
            server.sendmail(self.from_email or self.from_address, [to_address], msg.as_string())
            server.quit()
            print(f"✓ Email sent to {to_address}")
            return True
        except Exception as e:
            import traceback
            print(f"⚠ Error sending email to {to_address}: {e}")
            print(f"[SMTP Debug] Traceback: {traceback.format_exc()}")
            return False


if __name__ == '__main__':
    # Quick local import/test - does not send email unless SMTP is configured
    svc = EmailService()
    print('EmailService initialized', {'host': svc.smtp_host, 'port': svc.smtp_port, 'from': svc.from_address})
