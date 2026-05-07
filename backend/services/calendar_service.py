"""
Google Calendar integration service
Fetches events from Google Calendar and stores them in the database
"""
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

import pytz
from google.auth.transport.requests import Request
from google.oauth2 import credentials as oauth2_credentials
from google.oauth2.service_account import Credentials as ServiceAccountCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from config import config
from database import DB_PATH


class CalendarService:
    """
    Service to fetch events from Google Calendar
    Handles OAuth2 authentication and event sync
    """
    
    SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
    
    def __init__(self):
        """Initialize Calendar service"""
        self.service = None
        # Use the canonical DB path from database.py to avoid split SQLite files.
        self.db_path = DB_PATH
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Calendar API"""
        try:
            credentials = self._load_credentials()
            self.service = build('calendar', 'v3', credentials=credentials)
            print("✓ Google Calendar authenticated")
        except Exception as e:
            print(f"⚠ Calendar authentication warning: {e}")
            self.service = None
    
    def _load_credentials(self):
        """Load Google credentials with deployment-safe priority.

        Priority:
        1) Service account JSON (non-interactive)
        2) OAuth refresh token from env (non-interactive, Render-safe)
        3) Local interactive OAuth flow (only when ALLOW_INTERACTIVE_OAUTH=True)
        """
        creds_path = Path(config.GOOGLE_CREDENTIALS_PATH)

        # 1) Prefer service account if the credentials file is a service account key
        if creds_path.exists():
            try:
                with creds_path.open("r", encoding="utf-8") as f:
                    payload = json.load(f)
                if payload.get("type") == "service_account":
                    return ServiceAccountCredentials.from_service_account_file(
                        str(creds_path),
                        scopes=self.SCOPES,
                    )
            except Exception as e:
                print(f"⚠ Could not parse credentials file as service account: {e}")

        # 2) Use refresh-token OAuth from environment (recommended for Render)
        if (
            config.GOOGLE_CLIENT_ID
            and config.GOOGLE_CLIENT_SECRET
            and config.GOOGLE_REFRESH_TOKEN
        ):
            creds = oauth2_credentials.Credentials(
                token=None,
                refresh_token=config.GOOGLE_REFRESH_TOKEN,
                token_uri=config.GOOGLE_TOKEN_URI,
                client_id=config.GOOGLE_CLIENT_ID,
                client_secret=config.GOOGLE_CLIENT_SECRET,
                scopes=self.SCOPES,
            )
            creds.refresh(Request())
            return creds

        # 3) Local-only interactive OAuth login
        if config.ALLOW_INTERACTIVE_OAUTH:
            if not creds_path.exists():
                print(f"⚠ Credentials file not found at {config.GOOGLE_CREDENTIALS_PATH}")
                print("  For local setup, create OAuth credentials JSON.")
                print("  For deployed setup, set GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN.")
                raise FileNotFoundError(config.GOOGLE_CREDENTIALS_PATH)

            flow = InstalledAppFlow.from_client_secrets_file(
                str(creds_path),
                self.SCOPES,
            )
            return flow.run_local_server(port=0)

        raise RuntimeError(
            "Google Calendar auth is not configured for non-interactive deployment. "
            "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN, "
            "or use a service account JSON at GOOGLE_CREDENTIALS_PATH."
        )
    
    def fetch_and_sync_events(self, days_ahead: int = 90) -> List[Dict[str, Any]]:
        """
        Fetch events from Google Calendar for next N days
        Calculate lifecycle stage and urgency score
        Store in database
        """
        
        if not self.service:
            if config.ALLOW_DEMO_MODE:
                print("⚠ Calendar service not available, using demo events")
                return self._get_mock_events()
            raise RuntimeError(
                "Google Calendar is not configured. Set GOOGLE_CREDENTIALS_PATH and GOOGLE_CALENDAR_ID to run in full system mode."
            )
        
        try:
            events = []
            now = datetime.utcnow().isoformat() + 'Z'
            end_date = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + 'Z'
            
            print(f"📅 Fetching events from Google Calendar...")
            
            # Fetch events from calendar
            results = self.service.events().list(
                calendarId=config.GOOGLE_CALENDAR_ID,
                timeMin=now,
                timeMax=end_date,
                singleEvents=True,
                orderBy='startTime',
                maxResults=50
            ).execute()
            
            items = results.get('items', [])
            
            for item in items:
                event = self._parse_event(item)
                events.append(event)
                self._store_event_in_db(event)
            
            print(f"✓ Synced {len(events)} events from Google Calendar")
            return events
            
        except Exception as e:
            print(f"❌ Error fetching calendar events: {e}")
            if config.ALLOW_DEMO_MODE:
                return self._get_mock_events()
            raise
    
    def _parse_event(self, calendar_event: Dict) -> Dict[str, Any]:
        """Parse Google Calendar event into our format"""
        event_id = calendar_event.get('id', '')
        title = calendar_event.get('summary', 'Untitled Event')
        description = calendar_event.get('description', '')
        
        start = calendar_event.get('start', {})
        end = calendar_event.get('end', {})
        
        start_time_str = start.get('dateTime', start.get('date', ''))
        end_time_str = end.get('dateTime', end.get('date', ''))
        
        # Parse timestamps
        try:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        except:
            start_time = datetime.now()
            end_time = datetime.now()
        
        # Calculate lifecycle stage and urgency
        now = datetime.now(pytz.UTC) if start_time.tzinfo else datetime.now()
        if start_time.tzinfo is None:
            start_time = pytz.UTC.localize(start_time)
        
        days_until = (start_time - now).days
        
        if days_until < 0:
            lifecycle_stage = "post_event"
        elif days_until == 0:
            lifecycle_stage = "during_event"
        else:
            lifecycle_stage = "pre_event"
        
        # Urgency: 10 = happening now, 1 = 90 days away
        urgency_score = max(1, min(10, 10 - (max(0, days_until) // 10)))
        
        # Detect event type from title/description
        event_type = self._detect_event_type(title, description)
        
        return {
            'id': event_id,
            'title': title,
            'description': description,
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'event_type': event_type,
            'lifecycle_stage': lifecycle_stage,
            'urgency_score': urgency_score,
            'days_until': days_until
        }
    
    def _detect_event_type(self, title: str, description: str) -> str:
        """Detect event type from title and description"""
        text = (title + " " + description).lower()
        
        if any(word in text for word in ['seminar', 'seminar', 'presentation', 'talk']):
            return 'seminar'
        elif any(word in text for word in ['workshop', 'training', 'tutorial']):
            return 'workshop'
        elif any(word in text for word in ['conference', 'summit']):
            return 'conference'
        elif any(word in text for word in ['webinar', 'online']):
            return 'webinar'
        elif any(word in text for word in ['social', 'networking', 'meetup']):
            return 'social'
        else:
            return 'workshop'  # default
    
    def _store_event_in_db(self, event: Dict[str, Any]):
        """Store event in SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO events 
                (id, title, description, start_time, end_time, event_type, lifecycle_stage, urgency_score, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                event['id'],
                event['title'],
                event['description'],
                event['start_time'],
                event['end_time'],
                event['event_type'],
                event['lifecycle_stage'],
                event['urgency_score']
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"⚠ Error storing event in DB: {e}")
    
    def _get_mock_events(self) -> List[Dict[str, Any]]:
        """Return mock events for testing/demo"""
        now = datetime.now()
        
        mock_events = [
            {
                'id': 'mock_1',
                'title': 'Python Workshop - Advanced Topics',
                'description': 'Learn advanced Python concepts including decorators, metaclasses, and async programming.',
                'start_time': (now + timedelta(days=3)).isoformat(),
                'end_time': (now + timedelta(days=3, hours=3)).isoformat(),
                'event_type': 'workshop',
                'lifecycle_stage': 'pre_event',
                'urgency_score': 8,
                'days_until': 3
            },
            {
                'id': 'mock_2',
                'title': 'AI/ML Research Seminar',
                'description': 'Cutting-edge research in machine learning and artificial intelligence.',
                'start_time': (now + timedelta(days=15)).isoformat(),
                'end_time': (now + timedelta(days=15, hours=2)).isoformat(),
                'event_type': 'seminar',
                'lifecycle_stage': 'pre_event',
                'urgency_score': 5,
                'days_until': 15
            },
            {
                'id': 'mock_3',
                'title': 'University Tech Conference 2026',
                'description': 'Annual conference bringing together tech enthusiasts from across the region.',
                'start_time': (now + timedelta(days=45)).isoformat(),
                'end_time': (now + timedelta(days=46)).isoformat(),
                'event_type': 'conference',
                'lifecycle_stage': 'pre_event',
                'urgency_score': 3,
                'days_until': 45
            }
        ]
        
        for event in mock_events:
            self._store_event_in_db(event)
        
        print(f"✓ Loaded {len(mock_events)} mock events")
        return mock_events
    
    def get_events_from_db(self) -> List[Dict[str, Any]]:
        """Get all events from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM events ORDER BY start_time ASC")
            events = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            return events
        except Exception as e:
            print(f"❌ Error reading events from DB: {e}")
            return []
