"""End-to-end test: generate campaign, approve one content item, publish email and telegram if available.

Run this while the backend is running at http://127.0.0.1:8000
"""

import sys
import time
from urllib.parse import urlencode

try:
    import requests
except Exception as e:
    print("This script requires the 'requests' library. Install with: pip install requests")
    sys.exit(1)

API_BASE = "http://127.0.0.1:8000/api"

def api_get(path):
    url = API_BASE + path
    print(f"GET {url}")
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json()

def api_post(path, params=None, json=None):
    url = API_BASE + path
    if params:
        url = url + "?" + urlencode(params)
    print(f"POST {url}")
    r = requests.post(url, json=json, timeout=30)
    try:
        r.raise_for_status()
    except Exception:
        print("Status:", r.status_code, r.text)
        raise
    return r.json()


def main():
    try:
        events = api_get("/events?limit=5")
        if not events:
            print("No events returned by /events. Cannot continue.")
            return
        event = events[0]
        event_id = event.get('id')
        print("Using event:", event_id, event.get('title'))

        gen = api_post(f"/campaigns/generate", params={"event_id": event_id})
        campaign_id = gen.get('campaign_id')
        print("Generated campaign:", campaign_id)

        detail = api_get(f"/campaigns/{campaign_id}")
        contents = detail.get('content') or []
        if not contents:
            print("No content in generated campaign")
            return
        content = contents[0]
        content_id = content.get('id')
        print("Selected content:", content_id, content.get('platform'))

        # Approve
        appr = api_post(f"/approvals", params={"content_id": content_id, "approved_by": "e2e-tester"})
        print("Approval result:", appr)

        # Publish email
        try:
            email_resp = api_post(f"/content/{content_id}/publish/email")
            print("Email publish response:", email_resp)
        except Exception as e:
            print("Email publish failed:", e)

        # Check integrations status for telegram
        ints = api_get("/integrations/status")
        telegram_cfg = ints.get('telegram', {})
        if telegram_cfg.get('configured'):
            try:
                tg_resp = api_post(f"/content/{content_id}/publish/telegram")
                print("Telegram publish response:", tg_resp)
            except Exception as e:
                print("Telegram publish failed:", e)
        else:
            print("Telegram not configured on backend; skipping Telegram send.")

        # WhatsApp: backend endpoint requires recipient query param; skipping unless user provides RECIPIENT env var
        print("E2E test completed.")

    except Exception as e:
        print("E2E script error:", e)
        raise


if __name__ == '__main__':
    main()
