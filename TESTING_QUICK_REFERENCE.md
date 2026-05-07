# 🔧 Quick Reference: Aevum AI Credentials & Testing

## 📋 Credentials Checklist

After following the **CREDENTIAL_SETUP_GUIDE.md**, verify you have:

| Service | File/Location | What It's For |
|---------|---------------|--------------|
| **Google Calendar** | `credentials.json` | Fetch upcoming events |
| **Gemini API Key** | `.env` → `GEMINI_API_KEY` | AI content generation |
| **Gmail SMTP** | `.env` → `SMTP_*` | Send emails to team |
| **LinkedIn Token** | `.env` → `LINKEDIN_ACCESS_TOKEN` | Post to LinkedIn |

---

## 🚀 Quick Start (One-Time Setup)

```powershell
# 1. Navigate to project
cd "C:\Users\Abhi\Documents\Aevum AI"

# 2. Install dependencies (if not done)
python -m pip install -r requirements.txt

# 3. Create .env file (from guide Step 5)
# Edit .env with your real credentials

# 4. Initialize database
cd backend
python database.py
cd ..

# 5. Start backend
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

When you see this output, **everything is ready**:
```
✓ Aevum AI started
✓ Syncing events from Google Calendar...
✓ Google Calendar authenticated
```

---

## 🧪 Testing Endpoints

### 1️⃣ **Check All Services Status**
```powershell
Invoke-WebRequest http://localhost:8000/api/integrations/status | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "linkedin": { "configured": true, "mode": "live" },
  "smtp": { "configured": true, "mode": "live" },
  "gemini": { "configured": true, "mode": "live" },
  "calendar": { "configured": true, "mode": "live" }
}
```

### 2️⃣ **Fetch Calendar Events**
```powershell
$events = Invoke-WebRequest http://localhost:8000/api/events | ConvertFrom-Json
$events | ConvertTo-Json -Depth 3
```

### 3️⃣ **Generate Content from Event**
```powershell
# First, get an event ID from step 2, then:
$eventId = $events[0].id

$response = Invoke-WebRequest -Method POST `
  -Uri "http://localhost:8000/api/campaigns/generate?event_id=$eventId" `
  -Headers @{"Content-Type"="application/json"}

$campaign = $response.Content | ConvertFrom-Json
$campaign | ConvertTo-Json -Depth 5
```

### 4️⃣ **Approve Content**
```powershell
# Get a content ID from step 3 response
$contentId = $campaign.content_ids[0]

$response = Invoke-WebRequest -Method POST `
  -Uri "http://localhost:8000/api/approvals?content_id=$contentId&approved_by=test_user&comments=Good to go" `
  -Headers @{"Content-Type"="application/json"}

$response.Content | ConvertFrom-Json
```

### 5️⃣ **Send Email**
```powershell
$contentId = $campaign.content_ids[0]

$response = Invoke-WebRequest -Method POST `
  -Uri "http://localhost:8000/api/content/$contentId/publish/email?recipient=your.email@gmail.com&use_html=true" `
  -Headers @{"Content-Type"="application/json"}

$response.Content | ConvertFrom-Json
```

**Check your inbox!** You should receive an email.

### 6️⃣ **Post to LinkedIn**
```powershell
$contentId = $campaign.content_ids[1]

$response = Invoke-WebRequest -Method POST `
  -Uri "http://localhost:8000/api/content/$contentId/publish/linkedin" `
  -Headers @{"Content-Type"="application/json"}

$response.Content | ConvertFrom-Json
```

---

## 🔍 Debugging Issues

| Issue | Check |
|-------|-------|
| `credentials.json not found` | Save Google Cloud credentials.json to project root |
| `GEMINI_API_KEY invalid` | Verify exact API key from Google AI Studio |
| `Email won't send` | Verify SMTP_USERNAME/PASSWORD are from Gmail app password (not regular password) |
| `LinkedIn error` | Check token hasn't expired (valid 60 days) |
| `No events appearing` | Add events to your Google Calendar first |
| `Port 8000 already in use` | Change port: `--port 8001` or kill existing process |

---

## 📊 Full Workflow Test

Run the complete test script:
```powershell
.\test_full_workflow.ps1
```

This tests:
1. ✅ Calendar sync
2. ✅ Gemini content generation  
3. ✅ Email sending
4. ✅ LinkedIn posting

---

## 🎯 Next Steps After Testing

1. **Configure Frontend** (if not done):
   ```powershell
   npm run dev
   # Navigate to http://localhost:3000
   ```

2. **Enable Auto-Scheduling**:
   - Set `SCHEDULER_ENABLED=True` in `.env`
   - System generates content every 6 hours automatically

3. **Monitor Analytics**:
   - Check dashboard for approval/rejection metrics
   - Track email opens and LinkedIn engagement

---

## 📞 Support

If you encounter issues:

1. Check `CREDENTIAL_SETUP_GUIDE.md` for detailed setup
2. Verify `.env` file has all credentials
3. Confirm backend is running: `http://localhost:8000/health`
4. Review server logs for error messages

---

**Status: Ready for Production** ✅
Your system is live and ready to automate event publicity!
