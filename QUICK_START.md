# ⚡ Aevum AI - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Navigate to Project
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI"
```

### Step 2: Install Dependencies
```powershell
python -m pip install -q fastapi uvicorn pydantic python-dotenv google-api-python-client google-auth-oauthlib google-generativeai pytz requests python-dateutil aiohttp apscheduler
```

Verify installation:
```powershell
python -c "import fastapi; print(f'✓ FastAPI {fastapi.__version__} installed')"
```

### Step 3: Set Up Environment Variables

Copy the template:
```powershell
copy .env.example .env
```

Edit `.env` (open in any text editor) and add **AT MINIMUM**:

#### Option A: Use Google Gemini Free API (RECOMMENDED)
```
GEMINI_API_KEY=your-api-key-here
```
Get key: https://aistudio.google.com/app/apikeys

#### Option B: Configure Email Publishing
If you want approved content to send email drafts automatically, set:
```
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
```
Legacy aliases are also accepted by the backend:
```
EMAIL_SENDER=your-email@example.com
EMAIL_PASSWORD=your-app-password
```

#### Option C: Skip API for Demo
Leave `GEMINI_API_KEY=your-gemini-api-key` (system will use fallback mock agent)

### Step 4: Initialize Database
```powershell
cd backend
python database.py
cd ..
```

Output should show: `✓ Database initialized at ...`

### Step 5: Start FastAPI Backend
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 6: Test the API
Open in browser: http://localhost:8000/docs

You'll see the interactive Swagger documentation with all API endpoints!

---

## 🧪 Quick API Tests

### Health Check
```powershell
Invoke-WebRequest http://localhost:8000/health | ConvertFrom-Json | ConvertTo-Json
```

### Get Events
```powershell
Invoke-WebRequest http://localhost:8000/api/events | ConvertFrom-Json | ConvertTo-Json
```

### Generate Content (REQUIRES Gemini API Key)
```powershell
# Get an event_id from /api/events first
$eventId = "mock_1"
Invoke-WebRequest -Method POST "http://localhost:8000/api/campaigns/generate?event_id=$eventId" | ConvertFrom-Json | ConvertTo-Json
```

### View Analytics
```powershell
Invoke-WebRequest http://localhost:8000/api/analytics | ConvertFrom-Json | ConvertTo-Json
```

---

## 📁 Project Structure (What You Have)

```
backend/
├── main.py                       ← FastAPI app (all endpoints)
├── database.py                   ← SQLite setup
├── config.py                     ← Configuration
├── app/
│   ├── agents/
│   │   └── event_publicity_agent.py  ← THE INTELLIGENT AGENT ⭐
│   ├── services/
│   │   └── calendar_service.py       ← Google Calendar sync
│   └── schemas/
│       └── event.py                  ← Data models
```

---

## 🤖 What's Already Implemented (Day 1)

### ✅ Backend Complete
- [x] FastAPI server with 10+ endpoints
- [x] SQLite database with 5 tables (events, campaigns, content, approvals, analytics)
- [x] EventPublicityAgent class (decision-making AI)
- [x] Google Calendar integration (with mock data fallback)
- [x] Configuration management (.env)
- [x] API documentation (Swagger UI)
- [x] Mock events for testing (no API keys needed initially)

### ✅ Project Structure
- [x] Professional folder organization
- [x] Modular architecture
- [x] Clear separation of concerns
- [x] Ready for scaling

### ✅ Documentation
- [x] Comprehensive README
- [x] This quick start guide
- [x] Inline code comments

---

## 🔧 What's Next (Day 2-4)

### Day 2: EventPublicityAgent + Email
- [ ] Complete agent intelligence (platform selection, tone, hashtags)
- [ ] Email sending (Gmail SMTP or the `EMAIL_SENDER` / `EMAIL_PASSWORD` aliases)
- [ ] Multi-variation generation (3 per platform)
- [ ] Hashtag generation via Gemini

### Day 3: Approvals + Scheduler
- [ ] Approval workflow UI endpoints
- [ ] APScheduler for auto-generation (every 6 hours)
- [ ] Bulk approval
- [ ] Team notifications

### Day 4: React Frontend + Analytics
- [ ] React dashboard
- [ ] Campaign creation UI
- [ ] Approval queue
- [ ] Analytics visualization
- [ ] Real-time updates

---

## ❓ Common Issues & Fixes

### "ModuleNotFoundError: No module named 'fastapi'"
```powershell
python -m pip install fastapi uvicorn
```

### "GEMINI_API_KEY not set"
Either:
1. Add to `.env`: `GEMINI_API_KEY=your-key`
2. Or system will use fallback mock agent (works but generates generic content)

### "Port 8000 already in use"
```powershell
python -m uvicorn main:app --port 8001
```

### Database file not found
```powershell
cd backend
python database.py
```

### Can't find .env file
```powershell
copy .env.example .env
```

---

## 📊 Database Schema (What's Stored)

```sql
events              → Event data from Google Calendar
campaigns           → Content generation batches per event
generated_content   → AI-generated text (3 variations per platform)
approvals          → Team approval records
analytics          → Tracking of sent/posted content
```

---

## 🎯 What Makes This "Agentic"

1. **Decision-Making**: EventPublicityAgent decides platforms, tone, messaging (not rule-based)
2. **Autonomy**: Can be triggered by scheduler without human interaction
3. **Lifecycle Aware**: Different content for pre/during/post event stages
4. **Intelligent Variations**: 3 versions per platform for better quality

---

## 🚀 API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check if API is running |
| `/api/events` | GET | List events |
| `/api/events/{id}` | GET | Event details |
| `/api/events/sync` | POST | Sync from Google Calendar |
| `/api/campaigns/generate` | POST | Generate content via agent |
| `/api/campaigns/{id}` | GET | Campaign details + variations |
| `/api/approvals` | POST | Approve content |
| `/api/approvals/{id}/reject` | POST | Reject content |
| `/api/analytics` | GET | Dashboard analytics |

---

## 📚 Full Documentation

See `README.md` for:
- Detailed architecture
- Google Calendar setup
- Gemini API setup
- How the agent works
- Extended troubleshooting

---

## ✨ Current Status

**Day 1 Complete: Foundation Ready** ✅

Backend is fully functional with:
- ✅ All core endpoints
- ✅ Database setup
- ✅ Agent skeleton (can extend to Day 2 intelligence)
- ✅ Mock data for testing
- ✅ Professional code structure

Ready for frontend or extended agent features!

---

**Questions?** Check inline code comments in:
- `backend/main.py` - All endpoints explained
- `backend/app/agents/event_publicity_agent.py` - Agent logic
- `backend/app/services/calendar_service.py` - Calendar integration

Happy building! 🚀
