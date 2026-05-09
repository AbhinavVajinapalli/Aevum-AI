"""Directly call backend publish functions to test email and WhatsApp sends.

This script:
- Ensures DB schema exists
- Inserts approved generated_content rows for email and whatsapp
- Calls `publish_email` and `publish_whatsapp` from `backend.main` directly via asyncio

Uses the TWILIO and SMTP credentials from .env. The recipient number is used only for this test.
"""
import sys
from pathlib import Path
import sqlite3
import uuid
import asyncio

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from backend.database import init_db
from backend.config import config

from backend.main import publish_email, publish_whatsapp

DB = Path(__file__).resolve().parents[1] / "aevum_ai.db"


def insert_test_rows():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    campaign_id = f"camp_{uuid.uuid4().hex[:8]}"
    email_content_id = f"cont_{uuid.uuid4().hex[:8]}"
    whatsapp_content_id = f"cont_{uuid.uuid4().hex[:8]}"

    cursor.execute("INSERT INTO events (id, title, description, start_time, end_time, event_type, lifecycle_stage, urgency_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                   (event_id, 'API Test Event', 'Inserted by test_api_publish_direct', '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z', 'webinar', 'pre_event', 50))

    cursor.execute("INSERT INTO campaigns (id, event_id, stage, status, metadata) VALUES (?, ?, ?, 'draft', ?)",
                   (campaign_id, event_id, 'pre_event', '{}'))

    # Approved email content
    cursor.execute("INSERT INTO generated_content (id, campaign_id, platform, content_text, variation_num, tone, hashtags, status, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (email_content_id, campaign_id, 'email', 'API test email body', 1, 'professional', '', 'approved', 'approved'))

    # Approved whatsapp content
    cursor.execute("INSERT INTO generated_content (id, campaign_id, platform, content_text, variation_num, tone, hashtags, status, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (whatsapp_content_id, campaign_id, 'whatsapp', 'API test whatsapp message', 1, 'casual', '', 'approved', 'approved'))

    conn.commit()
    conn.close()

    return email_content_id, whatsapp_content_id


async def call_publish(email_id, wa_id, wa_recipient):
    try:
        print('Calling publish_email...')
        # Provide explicit recipient to avoid FastAPI Query default object when calling directly
        recipient = config.DEFAULT_ACCOUNT_EMAIL or None
        res = await publish_email(email_id, recipient=recipient)
        print('publish_email result:', res)
    except Exception as e:
        # FastAPI HTTPException often stores detail
        detail = getattr(e, 'detail', None)
        print('publish_email error type:', type(e))
        print('publish_email error detail:', detail)
        print('publish_email error repr:', repr(e))

    try:
        print('Calling publish_whatsapp...')
        res2 = await publish_whatsapp(wa_id, recipient=wa_recipient)
        print('publish_whatsapp result:', res2)
    except Exception as e:
        print('publish_whatsapp error:', e)


def main():
    # Ensure DB
    init_db()
    email_id, wa_id = insert_test_rows()

    # Build recipient E.164 (use India +91 if no +)
    raw = '9490476031'
    if raw.startswith('+'):
        e164 = raw
    else:
        e164 = '+91' + raw

    print('Using test recipient (temporary):', e164)
    asyncio.run(call_publish(email_id, wa_id, e164))


if __name__ == '__main__':
    main()
