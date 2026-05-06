# 🤖 Aevum AI - Event Publicity Agent

## Project Overview

**Aevum AI** is an intelligent, agentic AI system for automating university event publicity across multiple channels (Email, LinkedIn, and more). The system uses **EventPublicityAgent** to make autonomous strategic decisions about content generation, platform selection, tone, messaging, and lifecycle-based automation.

### Key Features

✨ **Agentic Decision-Making**: EventPublicityAgent intelligently analyzes events and decides:
- Optimal platforms for promotion (Email, LinkedIn)
- Content tone (formal, casual, promotional)
- Target audience strategy
- Hashtags and engagement hooks
- Posting schedules

📅 **Event Lifecycle Automation**: Different content for each stage:
- **Pre-event**: Promotional hype and registration drives
- **During-event**: Live updates and real-time engagement
- **Post-event**: Recap, thank you messages, feedback requests

🎯 **Multi-Variation Content**: 3 variations per platform allowing teams to choose the best version

📊 **Real-time Analytics**: Track approvals, rejections, sent content, and engagement by platform

🔄 **Semi-Autonomous Operation**: Background scheduler auto-generates drafts every 6 hours

---

## Project Structure

```
Aevum AI/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # SQLite schema setup
│   ├── config.py               # Configuration management
│   ├── app/
│   │   ├── __init__.py
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   └── event_publicity_agent.py  # THE INTELLIGENT AGENT
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── calendar_service.py      # Google Calendar sync
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── event.py                 # Pydantic models
│   │   ├── models/ (for future ORM)
│   │   ├── integrations/ (for email, LinkedIn, etc.)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   └── services/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example                # Template for environment variables
├── requirements.txt            # Python dependencies
└── README.md
```

---

## Quick Start

### 1. Clone & Setup

```bash
cd C:\Users\Abhi\Documents\Aevum\ AI
```

### 2. Create Python Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Full-system mode requires live credentials for all integrations:
- `GEMINI_API_KEY`: Gemini content generation
- `GOOGLE_CREDENTIALS_PATH` and `GOOGLE_CALENDAR_ID`: Calendar sync
- `SMTP_USERNAME` / `SMTP_PASSWORD`: Email publishing
- `LINKEDIN_ACCESS_TOKEN`: LinkedIn publishing
- `ALLOW_DEMO_MODE=False`: Keep the system in live-only mode

### 5. Initialize Database

```bash
cd backend
python database.py
```

This creates `aevum_ai.db` with all required tables.

If any required integration is missing and `ALLOW_DEMO_MODE=False`, the backend will fail fast with a clear configuration error instead of silently using mock data.

### 6. Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit: http://localhost:8000/docs (Swagger UI with all API endpoints)

---

## API Endpoints

### 📅 Events
- `GET /api/events` - List all events
- `GET /api/events/{event_id}` - Get event details
- `POST /api/events/sync` - Sync events from Google Calendar

### 🎯 Campaigns & Content Generation
- `POST /api/campaigns/generate` - Generate content using EventPublicityAgent
- `GET /api/campaigns/{campaign_id}` - Get campaign and its variations

### ✅ Approvals
- `POST /api/approvals` - Approve content
- `POST /api/approvals/{content_id}/reject` - Reject content

### 📊 Analytics
- `GET /api/analytics` - Get system-wide analytics

---

## How the Agent Works

### EventPublicityAgent Flow

```
Event Data (title, description, date, etc.)
    ↓
Lifecycle Stage Detection (pre_event, during_event, post_event)
    ↓
Urgency Calculation (1-10 scale based on days until event)
    ↓
Gemini LLM Analysis
    ├─ Audience Analysis
    ├─ Platform Selection
    ├─ Tone Decision
    ├─ Content Strategy
    └─ Generate 3 variations per platform
    ↓
Multi-Variation Content (Email, LinkedIn, etc.)
    ↓
Database Storage
    ↓
Team Approval Dashboard
    ↓
Approved Content → Send via Integrations
```

### Example Agent Decision

**Input Event:**
```json
{
  "title": "Python Workshop - Advanced Topics",
  "description": "Learn decorators, metaclasses, async programming",
  "event_type": "workshop",
  "lifecycle_stage": "pre_event",
  "urgency_score": 8
}
```

**Agent Output:**
```json
{
  "event_analysis": "Technical workshop targeting developers",
  "audience": "Software engineers and Python enthusiasts",
  "platforms": ["email", "linkedin"],
  "tone": "professional",
  "variations": [
    {
      "platform": "email",
      "variation_1": "Subject: Master Advanced Python Techniques",
      "variation_2": "Subject: Limited Spots: Python Workshop Next Week",
      "variation_3": "Subject: Don't Miss Our Advanced Python Training",
      "hashtags": ["#python", "#workshop", "#programming"],
      "scheduled_time": "09:00"
    },
    {
      "platform": "linkedin",
      "variation_1": "Excited to announce our Advanced Python Workshop...",
      "variation_2": "Join us for an in-depth exploration of Python...",
      "variation_3": "Level up your Python skills with our expert-led workshop...",
      "hashtags": ["#python", "#learning", "#development"],
      "scheduled_time": "08:00"
    }
  ]
}
```

---

## Setting Up Google Calendar Integration

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable **Google Calendar API**

### Step 2: Create OAuth2 Credentials (Deployment-safe)
1. Go to Credentials → Create Credentials → OAuth 2.0 Web Application
2. Add redirect URI (for one-time consent flow), e.g. `http://localhost:8080/oauth2callback`
3. Copy Client ID and Client Secret

### Step 3: Configure .env
```env
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_CALENDAR_ID=your-calendar@gmail.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
ALLOW_INTERACTIVE_OAUTH=False
```

### Step 4: First Run
In hosted environments (Render/Railway), the backend uses refresh-token auth and does not require interactive browser login.
For local dev, you can still use interactive login by setting `ALLOW_INTERACTIVE_OAUTH=True`.

---

## Setting Up Gemini API

### Get Free API Key
1. Visit https://aistudio.google.com/app/apikeys
2. Click "Get API Key"
3. Select your Google Cloud project
4. Copy the key

### Add to .env
```env
GEMINI_API_KEY=your-api-key-here
```

---

## Testing the System

### 1. Check Health
```bash
curl http://localhost:8000/health
```

### 2. Get Events
```bash
curl http://localhost:8000/api/events
```

### 3. Generate Content for an Event
```bash
curl -X POST http://localhost:8000/api/campaigns/generate?event_id=mock_1
```

### 4. Get Campaign Details
```bash
curl http://localhost:8000/api/campaigns/camp_xxxxx
```

### 5. Approve Content
```bash
curl -X POST "http://localhost:8000/api/approvals?content_id=cont_xxxxx&approved_by=team@university.edu"
```

### 6. View Analytics
```bash
curl http://localhost:8000/api/analytics
```

---

## Frontend React Setup (Later)

The React frontend will have:
- Event dashboard
- Campaign creation wizard
- Approval queue with variations
- Analytics dashboard
- Bulk approval actions

More details coming in Phase 2!

---

## Architecture Decisions

### Why EventPublicityAgent?
- **True Agentic**: Not rule-based; makes intelligent decisions via LLM
- **Autonomous**: Can be called by scheduler without human interaction
- **Adaptive**: Adjusts strategy based on event type, lifecycle stage, urgency
- **Explainable**: Provides reasoning for all decisions

### Why Multi-Variation?
- Gives teams options without endless regeneration
- Faster approval cycles
- Improves content quality through selection

### Why Lifecycle Stages?
- **Pre-event**: Build anticipation, drive registrations
- **During-event**: Create FOMO, live engagement
- **Post-event**: Build relationships, gather feedback

---

## Next Steps (Day 2-4)

1. **Day 2**: Complete EventPublicityAgent with full decision logic + email integration
2. **Day 3**: Add LinkedIn integration + approval workflow + scheduler
3. **Day 4**: Build React frontend dashboard + analytics

---

## Troubleshooting

### Database Not Found
```bash
cd backend
python database.py
```

### Gemini API Errors
- Ensure `GEMINI_API_KEY` is set in `.env`
- Check API quota at https://aistudio.google.com/app/apikeys

### Google Calendar Not Syncing
- Verify `credentials.json` exists in `backend/` folder
- Check `GOOGLE_CALENDAR_ID` format (should be email-like)
- First run requires browser authorization

### Port 8000 Already in Use
```bash
# Use a different port
uvicorn main:app --port 8001
```

---

## Dependencies

- **FastAPI**: Web framework
- **Pydantic**: Data validation
- **Google APIs**: Calendar and Generative AI (Gemini)
- **SQLite**: Lightweight database
- **Python 3.9+**: Required

---

## License

MIT License - Feel free to use for personal/educational projects

---

## Questions?

Check the code comments and docstrings for detailed explanations of each component!

🚀 **Happy event promoting with Aevum AI!**
