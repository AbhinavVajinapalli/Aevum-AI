#!/usr/bin/env python3
"""Test the complete approval-to-email flow"""
import os
import sys
import sqlite3
import json
import requests
from pathlib import Path

# Setup
backend_url = "http://localhost:8000"
db_path = Path("backend/database.db")

def check_smtp_config():
    """Check if SMTP is configured in backend"""
    try:
        resp = requests.get(f"{backend_url}/api/integrations/status", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            print(f"✓ SMTP Configured: {data.get('smtp', {}).get('configured', False)}")
            print(f"✓ SMTP Mode: {data.get('smtp', {}).get('mode', 'unknown')}")
            return data.get('smtp', {}).get('configured', False)
    except Exception as e:
        print(f"✗ Error checking SMTP config: {e}")
    return False

def check_database():
    """Check if there are any approved contents"""
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check all content items
        cursor.execute("SELECT * FROM generated_content LIMIT 1")
        content = cursor.fetchone()
        if content:
            content_dict = dict(content)
            print(f"\n✓ Content found in DB:")
            print(f"  - ID: {content_dict.get('id')}")
            print(f"  - Platform: {content_dict.get('platform')}")
            print(f"  - Status: {content_dict.get('approval_status')}")
            print(f"  - Text: {content_dict.get('content_text', '')[:60]}...")
            conn.close()
            return content_dict
        else:
            print(f"\n✗ No content found in database")
            conn.close()
            return None
    except Exception as e:
        print(f"✗ Error checking database: {e}")
        return None

def check_approval_endpoint():
    """Check if we can approve content"""
    content = check_database()
    if not content:
        print("\n✗ Cannot test approval - no content in DB")
        return False
    
    try:
        content_id = content['id']
        resp = requests.post(
            f"{backend_url}/approvals?content_id={content_id}&approved_by=test-user",
            timeout=5
        )
        if resp.status_code == 200:
            print(f"\n✓ Approval endpoint working")
            result = resp.json()
            print(f"  - Approval result: {result}")
            return True
        else:
            print(f"\n✗ Approval endpoint returned {resp.status_code}")
            print(f"  - Response: {resp.text}")
            return False
    except Exception as e:
        print(f"\n✗ Error testing approval: {e}")
        return False

def check_email_publish_endpoint():
    """Check if email publish endpoint is reachable"""
    content = check_database()
    if not content:
        print("\n✗ Cannot test email publish - no content in DB")
        return False
    
    try:
        content_id = content['id']
        recipient = os.getenv("DEFAULT_ACCOUNT_EMAIL", "test@example.com")
        
        print(f"\n✓ Testing email publish endpoint:")
        print(f"  - Content ID: {content_id}")
        print(f"  - Recipient: {recipient}")
        print(f"  - Platform: {content['platform']}")
        
        # First approve it
        requests.post(
            f"{backend_url}/approvals?content_id={content_id}&approved_by=test-user",
            timeout=5
        )
        
        # Then try to publish email
        resp = requests.post(
            f"{backend_url}/api/content/{content_id}/publish/email?recipient={recipient}&use_html=true",
            timeout=5
        )
        
        if resp.status_code == 200:
            print(f"\n✓ Email publish endpoint working")
            result = resp.json()
            print(f"  - Status: {result.get('status')}")
            print(f"  - Message: {result.get('message')}")
            return True
        else:
            print(f"\n✗ Email publish endpoint returned {resp.status_code}")
            print(f"  - Response: {resp.text}")
            return False
    except Exception as e:
        print(f"\n✗ Error testing email publish: {e}")
        return False

if __name__ == "__main__":
    print("=== Aevum AI - Email Approval Flow Diagnostic ===\n")
    
    print("1. Checking SMTP Configuration...")
    smtp_ok = check_smtp_config()
    
    print("\n2. Checking Database Content...")
    content = check_database()
    
    if content:
        print("\n3. Testing Approval Endpoint...")
        approval_ok = check_approval_endpoint()
        
        if approval_ok:
            print("\n4. Testing Email Publish Endpoint...")
            email_ok = check_email_publish_endpoint()
    
    print("\n=== Diagnostic Complete ===")
