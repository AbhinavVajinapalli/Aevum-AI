#!/usr/bin/env python3
"""Complete diagnostic of email approval flow"""
import sqlite3
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

# Load config
from config import config

# Check 1: Email Configuration
print("="*70)
print("EMAIL APPROVAL FLOW DIAGNOSTIC")
print("="*70)

print("\n1. SMTP CONFIGURATION")
print("-" * 70)
print(f"  SMTP Server: {config.SMTP_SERVER}")
print(f"  SMTP Port: {config.SMTP_PORT}")
print(f"  SMTP Username: {config.SMTP_USERNAME}")
print(f"  SMTP Password: {'*' * len(config.SMTP_PASSWORD) if config.SMTP_PASSWORD else '(NOT SET)'}")
print(f"  Email From Name: {config.EMAIL_FROM_NAME}")
print(f"  Default Recipient: {config.DEFAULT_ACCOUNT_EMAIL}")

smtp_ready = (
    config.SMTP_USERNAME and 
    config.SMTP_PASSWORD and 
    config.SMTP_SERVER and 
    config.SMTP_PORT
)
print(f"\n  ✓ SMTP READY: {smtp_ready}")

# Check 2: Database
print("\n2. DATABASE CONTENT")
print("-" * 70)
db_path = Path(__file__).parent / "aevum_ai.db"
if not db_path.exists():
    print(f"  Database not found - creating...")
    from database import init_db
    init_db()

conn = sqlite3.connect(str(db_path))
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row['name'] for row in cursor.fetchall()]
print(f"  Tables: {', '.join(tables) if tables else '(none)'}")

if not tables:
    print(f"  Initializing database...")
    from database import init_db
    init_db()
    conn.close()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

# Check content
cursor.execute("SELECT COUNT(*) as cnt FROM generated_content")
count = cursor.fetchone()['cnt']
print(f"  Content Items: {count}")

if count == 0:
    print(f"  Creating sample content...")
    content_id = "test_content_001"
    campaign_id = "test_campaign_001"
    
    cursor.execute("""
    INSERT INTO generated_content 
    (id, campaign_id, platform, content_text, approval_status, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (content_id, campaign_id, "email", "Test Email Content", "pending"))
    conn.commit()
    print(f"  ✓ Created sample content: {content_id}")

# Check 3: Approval Flow
print("\n3. APPROVAL FLOW")
print("-" * 70)

cursor.execute("""
SELECT id, platform, approval_status 
FROM generated_content 
WHERE platform = 'email' LIMIT 1
""")
content = cursor.fetchone()

if content:
    content_id = content['id']
    print(f"  Content ID: {content_id}")
    print(f"  Current Status: {content['approval_status']}")
    
    print(f"\n  Simulating approval...")
    cursor.execute("""
    UPDATE generated_content 
    SET approval_status = 'approved'
    WHERE id = ?
    """, (content_id,))
    conn.commit()
    print(f"  ✓ Content approved")
    
    cursor.execute("SELECT approval_status FROM generated_content WHERE id = ?", (content_id,))
    status = cursor.fetchone()['approval_status']
    print(f"  ✓ Verified Status: {status}")

# Check 4: Email Service
print("\n4. EMAIL SERVICE CHECK")
print("-" * 70)

try:
    from integrations.email_service import EmailService
    email_service = EmailService()
    print(f"  SMTP User: {email_service.smtp_user}")
    print(f"  SMTP Pass: {'*' * len(email_service.smtp_pass) if email_service.smtp_pass else '(NOT SET)'}")
    print(f"  From Address: {email_service.from_address}")
    print(f"  ✓ Email Service Initialized Successfully")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Check 5: Frontend Configuration
print("\n5. FRONTEND CONFIGURATION")
print("-" * 70)

env_file = Path(__file__).parent / ".env"
found_next_public = False
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if 'NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL' in line and not line.strip().startswith('#'):
                print(f"  ✓ {line.strip()}")
                found_next_public = True
                break

if not found_next_public:
    print(f"  ✗ NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL not found in .env!")
    print(f"  ⚠ Frontend will use default 'test@example.com' as recipient")

print(f"\n  ⚠ NOTE: Vercel frontend needs rebuilding to use updated .env")

# Summary
print("\n" + "="*70)
print("APPROVAL-TO-EMAIL FLOW")
print("="*70)
print("""
1. User approves draft in dashboard
   → Frontend: bulkApproveContent(contentIds)
   → Backend: Updates approval_status = 'approved'

2. If SMTP configured AND email platform:
   → Frontend: publishEmail(contentId)
   → POST /api/content/{contentId}/publish/email?recipient=...

3. Backend endpoint processes:
   → Gets content from DB
   → Checks: approval_status == 'approved'?
   → Calls: email_service.send_email(recipient, subject, body)
   → Records result in analytics table

4. EmailService sends via SMTP:
   → Connects to smtp.gmail.com:587
   → Uses TLS encryption
   → Sends email to recipient

CRITICAL: If NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL missing from .env,
frontend will send emails to 'test@example.com' instead!
""")

conn.close()
print("Diagnostic complete.\n")
