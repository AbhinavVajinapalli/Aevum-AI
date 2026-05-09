"""Test script to send an email using backend EmailService and .env credentials.

Usage: python scripts/test_smtp_send.py
"""
import sys
from pathlib import Path

# Ensure project root is on sys.path so backend package imports work
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from backend.integrations.email_service import EmailService
from backend.config import config


def main():
    svc = EmailService()
    recipient = config.DEFAULT_ACCOUNT_EMAIL or svc.smtp_user
    if not recipient:
        print("No recipient configured in DEFAULT_ACCOUNT_EMAIL or SMTP_USERNAME. Aborting.")
        return

    subject = "Aevum AI - Test Email"
    body = "This is a test email sent by scripts/test_smtp_send.py to verify SMTP settings.\nIf you received this, SMTP is configured correctly." 

    print("Using SMTP server:", svc.smtp_host, svc.smtp_port)
    print("From:", svc.from_address)
    print("To:", recipient)

    success = svc.send_email(recipient, subject, body, html=False)
    if success:
        print("Test email sent successfully.")
    else:
        print("Test email failed. Check SMTP credentials and logs.")


if __name__ == '__main__':
    main()
