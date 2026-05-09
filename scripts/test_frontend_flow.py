"""Simulate frontend publish actions via FastAPI TestClient.

This script:
- Inserts a test event, campaign, and two `generated_content` rows (email and whatsapp) marked approved.
- Calls the email publish endpoint and the whatsapp publish endpoint using TestClient.

Usage: python scripts/test_frontend_flow.py

NOTE: Uses TWILIO credentials from .env and will attempt a real WhatsApp send to the provided number.
"""
import sys
from pathlib import Path
import sqlite3
import uuid
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from fastapi.testclient import TestClient

from backend.main import app
from backend.config import config

DB = Path(__file__).resolve().parents[1] / "aevum_ai.db"


def ensure_db():
    # initialize schema if missing
    from backend.database import init_db

    init_db()


def insert_test_rows():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    campaign_id = f"camp_{uuid.uuid4().hex[:8]}"
    email_content_id = f"cont_{uuid.uuid4().hex[:8]}"
    whatsapp_content_id = f"cont_{uuid.uuid4().hex[:8]}"

    cursor.execute("INSERT INTO events (id, title, description, start_time, end_time, event_type, lifecycle_stage, urgency_score) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?)",
                   (event_id, 'Test Event', 'Inserted by test_frontend_flow', '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z', 'webinar', 'pre_event', 50))

    cursor.execute("INSERT INTO campaigns (id, event_id, stage, status, metadata) VALUES (?, ?, ?, 'draft', ?)",
                   (campaign_id, event_id, 'pre_event', '{}'))

    # Approved email content
    cursor.execute("INSERT INTO generated_content (id, campaign_id, platform, content_text, variation_num, tone, hashtags, status, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (email_content_id, campaign_id, 'email', 'Test email body from frontend perspective', 1, 'professional', '', 'approved', 'approved'))

    # Approved whatsapp content
    cursor.execute("INSERT INTO generated_content (id, campaign_id, platform, content_text, variation_num, tone, hashtags, status, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (whatsapp_content_id, campaign_id, 'whatsapp', 'Test WhatsApp message from frontend perspective', 1, 'casual', '', 'approved', 'approved'))

    conn.commit()
    conn.close()

    return email_content_id, whatsapp_content_id


def run_tests(whatsapp_number_e164):
    client = TestClient(app)

    # Create test data
    ensure_db()
    email_id, wa_id = insert_test_rows()

    print("Calling email publish endpoint for content:", email_id)
    resp = client.post(f"/api/content/{email_id}/publish/email")
    print("Email publish response status:", resp.status_code, resp.text)

    print("Calling WhatsApp publish endpoint for content:", wa_id)
    resp2 = client.post(f"/api/content/{wa_id}/publish/whatsapp?recipient={whatsapp_number_e164}")
    print("WhatsApp publish response status:", resp2.status_code, resp2.text)


if __name__ == '__main__':
    # Use provided test number; assume +91 if no country code provided for this test
    raw = "9490476031"
    if raw.startswith('+'):
        e164 = raw
    else:
        # Default to India +91
        e164 = "+91" + raw

    print("Test recipient (temporary, not stored):", e164)
    run_tests(e164)
