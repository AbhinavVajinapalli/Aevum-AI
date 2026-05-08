#!/usr/bin/env python3
"""Test email sending by simulating the frontend approval workflow"""
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from config import config
from integrations.email_service import EmailService
import uuid

print("="*70)
print("EMAIL SEND TEST - SIMULATING APPROVAL WORKFLOW")
print("="*70)

# Setup
db_path = Path(__file__).parent / "aevum_ai.db"
if not db_path.exists():
    print("Creating database...")
    from database import init_db
    init_db()

conn = sqlite3.connect(str(db_path))
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get an approved email content item
print("\n1. Getting approved content...")
cursor.execute("""
SELECT id, platform, content_text, approval_status
FROM generated_content 
WHERE platform = 'email' AND approval_status = 'approved'
LIMIT 1
""")
content = cursor.fetchone()

if not content:
    print("   Creating test content...")
    content_id = f"email_test_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO generated_content 
    (id, campaign_id, platform, content_text, approval_status)
    VALUES (?, ?, ?, ?, ?)
    """, (content_id, "test_campaign", "email", "Test Email Body", "approved"))
    conn.commit()
    
    cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
    content = cursor.fetchone()

content_id = content['id']
print(f"   ✓ Content ID: {content_id}")
print(f"   ✓ Status: {content['approval_status']}")
print(f"   ✓ Text: {content['content_text'][:50]}...")

# Test email sending
print("\n2. Testing email send...")
recipient = config.DEFAULT_ACCOUNT_EMAIL
subject = "Test Email from Aevum AI"
body = content['content_text']

print(f"   Recipient: {recipient}")
print(f"   Subject: {subject}")

try:
    email_service = EmailService()
    result = email_service.send_email(recipient, subject, body, html=False)
    
    print(f"\n   {'✓' if result else '✗'} Email Send Result: {result}")
    
    if result:
        # Record in analytics
        analytics_id = f"anal_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO analytics (id, platform, content_id, status, sent_at, response_status)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        """, (analytics_id, 'email', content_id, 'sent', 200))
        conn.commit()
        print(f"   ✓ Recorded in analytics: {analytics_id}")
        print(f"\n✓ EMAIL SENT SUCCESSFULLY!")
    else:
        print(f"   ✗ Email send failed")
        
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

conn.close()

print("\n" + "="*70)
print("TEST SUMMARY")
print("="*70)
print("""
IF EMAIL SENT SUCCESSFULLY:
  → Backend email infrastructure is working
  → SMTP credentials are valid
  → Issue is likely in frontend rebuild
  → SOLUTION: Redeploy frontend on Vercel to update NEXT_PUBLIC_* variables

IF EMAIL SEND FAILED:
  → Check SMTP credentials
  → Check email_service.py implementation
  → Check logs for specific error message
""")
