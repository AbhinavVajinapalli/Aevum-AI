#!/usr/bin/env python3
"""
Test script: End-to-end campaign generation
1. Fetch events from API
2. Call generate campaign for first event
3. Display response
"""
import json
import requests

BASE_URL = "http://127.0.0.1:8000"

print("=" * 70)
print("STEP 1: Fetch events from /api/events")
print("=" * 70)

resp_events = requests.get(f"{BASE_URL}/api/events")
print(f"Status: {resp_events.status_code}")
events = resp_events.json()
print(f"Total events: {len(events)}\n")

if events:
    event = events[0]
    print("First event:")
    print(f"  ID: {event['id']}")
    print(f"  Title: {event['title']}")
    print(f"  Type: {event['event_type']}")
    print(f"  Lifecycle: {event['lifecycle_stage']}")
    print(f"  Urgency: {event['urgency_score']}\n")
    
    print("=" * 70)
    print(f"STEP 2: Generate campaign for event {event['id']}")
    print("=" * 70)
    
    resp_gen = requests.post(f"{BASE_URL}/api/campaigns/generate?event_id={event['id']}")
    print(f"Status: {resp_gen.status_code}\n")
    
    gen_result = resp_gen.json()
    print("Campaign Response:")
    print(json.dumps(gen_result, indent=2))
    
    print("\n" + "=" * 70)
    print("STEP 3: Retrieve campaign details")
    print("=" * 70)
    
    campaign_id = gen_result.get('campaign_id')
    resp_campaign = requests.get(f"{BASE_URL}/api/campaigns/{campaign_id}")
    print(f"Status: {resp_campaign.status_code}\n")
    
    campaign_data = resp_campaign.json()
    print(f"Campaign ID: {campaign_data['campaign']['id']}")
    print(f"Total variations: {campaign_data['total_variations']}\n")
    
    print("Content variations:")
    for i, content in enumerate(campaign_data['content'], 1):
        print(f"\n[{i}] Platform: {content['platform']}")
        print(f"    Variation: {content['variation_num']}")
        print(f"    Approval Status: {content['approval_status']}")
        print(f"    Text Preview: {content['content_text'][:100]}...")
else:
    print("No events found!")
