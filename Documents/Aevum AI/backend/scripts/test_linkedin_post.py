#!/usr/bin/env python
import sys
import os

os.chdir('C:/Users/Abhi/Documents/Aevum AI/backend')
sys.path.insert(0, os.getcwd())

from app.integrations.linkedin_service import LinkedInService

svc = LinkedInService()
print("=== LinkedIn Posting Diagnostic ===")
print("Configured:", svc.is_configured())
print("Author URN:", svc.get_author_urn())
print("Profile:", svc.get_profile())
print("\n=== Dry-Run Post ===")
result = svc.post_content('Aevum AI: Test event publicity automation post')
print("Result:", result)
print("\n=== Summary ===")
if result.get('success'):
    print("SUCCESS: LinkedIn post created! Post ID:", result.get('post_id'))
else:
    print("FAILED: ", result.get('message'))
