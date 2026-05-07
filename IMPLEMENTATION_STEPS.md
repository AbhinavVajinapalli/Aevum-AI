# 🎯 STEP-BY-STEP IMPLEMENTATION GUIDE
## Connect Real Credentials & Verify Live Workflow

---

## 📌 BEFORE YOU START
- [ ] You have a Google account
- [ ] You have a Gmail account (or other email)
- [ ] You have a LinkedIn account
- [ ] You have access to Google Cloud Console
- [ ] Your backend project is already set up

---

# PHASE 1: COLLECT CREDENTIALS (30 minutes)

## STEP 1: Google Calendar Setup (10 min)

### 1a. Create Google Cloud Project
1. Open https://console.cloud.google.com/
2. Click **"Select a Project"** dropdown (top left)
3. Click **"NEW PROJECT"**
4. Enter Project name: **Aevum AI**
5. Click **CREATE** and wait 1-2 minutes

### 1b. Enable APIs
1. Go to **APIs & Services** → **Library** (left sidebar)
2. Search for **"Google Calendar API"**
3. Click on result
4. Click **ENABLE** button
5. Repeat for **"Gmail API"** (search, click, enable)

### 1c. Create OAuth2 Credentials
1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS**
3. If prompted for consent screen, select **"External"** and fill:
   - App name: `Aevum AI`
   - Your email
   - Developer contact email
   - Save and continue (skip scopes, skip test users)
4. Click **+ CREATE CREDENTIALS** again
5. Choose **OAuth 2.0 Client IDs**
6. Application type: **Web application**
7. Name: `Aevum AI Web`
8. Add redirect URI: `http://localhost:8080/oauth2callback`
9. Click **CREATE**
10. Save these values for `.env`:
   - Client ID -> `GOOGLE_CLIENT_ID`
   - Client Secret -> `GOOGLE_CLIENT_SECRET`
11. Optional: download JSON and save as **credentials.json** for local interactive fallback:
   ```
   C:\Users\Abhi\Documents\Aevum AI\credentials.json
   ```

### 1d. Get Calendar ID
1. Go to https://calendar.google.com
2. Find your calendar on left side
3. Click **⋮** (three dots) → **Settings**
4. Scroll down for **Calendar ID** (example: `abc123@group.calendar.google.com`)
5. **COPY IT** → you'll need in Step 5

✅ **DONE WITH GOOGLE CALENDAR**
- [ ] credentials.json saved
- [ ] Calendar ID copied

---

## STEP 2: Gemini API Key (2 min)

### 2a. Get Free API Key
1. Go to https://aistudio.google.com/app/apikeys
2. Click **"Create API Key"**
3. Popup shows your key
4. **COPY IT IMMEDIATELY** and save somewhere safe
5. This is free tier with generous limits

✅ **DONE WITH GEMINI**
- [ ] API key copied

---

## STEP 3: Gmail SMTP Setup (5 min)

### 3a. Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow the setup (if not already done)

### 3b. Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Device: `Other (custom)` → Enter **Aevum AI**
3. Click **GENERATE**
4. Google shows a **16-character password** like: `abcd efgh ijkl mnop`
5. **COPY IT** immediately (you won't see it again)

### 3c. Collect SMTP Details
Save these values (you'll need them in Step 5):
- **SMTP_SERVER**: `smtp.gmail.com`
- **SMTP_PORT**: `587`
- **SMTP_USERNAME**: `your.email@gmail.com`
- **SMTP_PASSWORD**: The 16-char password from 3b
- **TEAM_EMAIL**: `your.email@gmail.com`
- **EMAIL_FROM_NAME**: `Aevum AI` (or your name)

✅ **DONE WITH SMTP**
- [ ] 2FA enabled
- [ ] App password copied
- [ ] SMTP details collected

---

## STEP 4: LinkedIn Setup (8 min)

### 4a. Create LinkedIn App
1. Go to https://www.linkedin.com/developers/apps
2. Click **"Create app"**
3. Fill in:
   - **App name**: `Aevum AI`
   - **LinkedIn Page**: Create or select existing (required)
   - **App logo**: Upload any image
   - Check legal agreement box
4. Click **CREATE APP**

### 4b. Generate Access Token
1. Go to **Auth** tab in your app
2. Find **"Your access token"** section
3. Click **"Generate access token"**
4. Token appears (valid for 60 days)
5. **COPY IT**
6. Save as **LINKEDIN_ACCESS_TOKEN**

✅ **DONE WITH LINKEDIN**
- [ ] App created
- [ ] Access token copied

---

# PHASE 2: CREATE .env FILE (5 minutes)

## STEP 5: Create Environment File

### 5a. Open Text Editor
1. Open **Notepad** or **VS Code**
2. Copy the template below:

```env
# App Configuration
APP_NAME=Aevum AI - Event Publicity Agent
APP_VERSION=0.1.0
DEBUG=True
LOG_LEVEL=INFO

# Database
DATABASE_URL=sqlite:///./aevum_ai.db

# Google APIs
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_CALENDAR_ID=YOUR_CALENDAR_ID_HERE
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Email (SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=YOUR_GMAIL_ADDRESS@gmail.com
SMTP_PASSWORD=YOUR_16_CHAR_APP_PASSWORD
EMAIL_FROM_NAME=Aevum AI
TEAM_EMAIL=YOUR_GMAIL_ADDRESS@gmail.com

# LinkedIn
LINKEDIN_ACCESS_TOKEN=YOUR_LINKEDIN_TOKEN_HERE

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Scheduler
SCHEDULER_ENABLED=True
SCHEDULER_INTERVAL_HOURS=6
ALLOW_DEMO_MODE=False
```

### 5b. Replace Placeholders

Replace these with your actual values from Steps 1-4:

| Placeholder | Replace With | Source |
|-------------|--------------|--------|
| `YOUR_CALENDAR_ID_HERE` | `abc123@group.calendar.google.com` | Step 1d |
| `YOUR_GEMINI_API_KEY_HERE` | `AIzaSy...` | Step 2a |
| `YOUR_GMAIL_ADDRESS@gmail.com` | Your Gmail | Step 3c |
| `YOUR_16_CHAR_APP_PASSWORD` | `abcd efgh ijkl mnop` | Step 3b |
| `YOUR_LINKEDIN_TOKEN_HERE` | `AQXxxx...` | Step 4b |

### 5c. Save File
1. **File** → **Save As**
2. Filename: `.env`
3. Location: `C:\Users\Abhi\Documents\Aevum AI\`
4. **Save**

✅ **DONE WITH .env**
- [ ] .env file created with all credentials

---

# PHASE 3: START BACKEND (5 minutes)

## STEP 6: Install Dependencies & Start

### 6a. Open PowerShell
```powershell
# Navigate to project
cd "C:\Users\Abhi\Documents\Aevum AI"
```

### 6b. Install Requirements
```powershell
python -m pip install -r requirements.txt
```

Expected output:
```
Successfully installed fastapi uvicorn pydantic ...
```

### 6c. Initialize Database
```powershell
cd backend
python database.py
cd ..
```

Expected output:
```
✓ Database initialized at ./aevum_ai.db
```

### 6d. Start Backend Server
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**WAIT FOR THIS OUTPUT:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000

✓ Aevum AI started
✓ Syncing events from Google Calendar...
✓ Google Calendar authenticated
✓ Gemini API initialized
✓ Email service ready
✓ LinkedIn service ready
```

✅ **ALL SERVICES RUNNING**
- [ ] Backend started on port 8000
- [ ] All ✓ messages appear

---

# PHASE 4: VERIFY CREDENTIALS (10 minutes)

## STEP 7: Check Integration Status

### 7a. Open NEW PowerShell Window
(Keep backend running in first window)

```powershell
# Check all integrations
Invoke-WebRequest http://localhost:8000/api/integrations/status -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "linkedin": { "configured": true, "mode": "live" },
  "smtp": { "configured": true, "mode": "live" },
  "gemini": { "configured": true, "mode": "live" },
  "calendar": { "configured": true, "mode": "live" }
}
```

If any show `false`, check your `.env` file!

✅ **ALL INTEGRATIONS CONFIGURED**
- [ ] Response shows all `"configured": true`

---

# PHASE 5: FULL WORKFLOW TEST (10 minutes)

## STEP 8: Test Complete Workflow

### 8a. Run Test Script
```powershell
.\test_full_workflow.ps1
```

This tests:
1. 📅 Calendar sync
2. 🤖 Gemini content generation
3. 📧 Email sending
4. 💼 LinkedIn posting

### 8b. Monitor Output

**Expected:**
```
✅ Found 5 events from Google Calendar
✅ Generated campaign with 3 variations
✅ Email test successful
✅ LinkedIn test successful

✨ WORKFLOW TEST COMPLETE
⏱️ Test completed in 4.5 seconds
✅ ALL SYSTEMS OPERATIONAL
```

✅ **FULL WORKFLOW VERIFIED**
- [ ] All 4 tests pass
- [ ] No errors in output

---

# PHASE 6: MANUAL VERIFICATION (5 minutes)

## STEP 9: Verify Each Service Individually

### 9a. Check Email Inbox
1. Open your Gmail
2. Look for email from "Aevum AI"
3. Verify it contains event publicity content

**Result:** Email received ✅

### 9b. Check LinkedIn
1. Open LinkedIn
2. Check your profile feed
3. Look for recent post about event

**Result:** LinkedIn post visible ✅

### 9c. Check Google Calendar
1. Open Google Calendar
2. Verify events are showing
3. Check that events are from next 90 days

**Result:** Events synced ✅

### 9d. Test Content Variations
```powershell
# Get a campaign to see 3 variations per platform
$eventId = "your-event-id"  # Get from /api/events

$response = Invoke-WebRequest -Method POST `
  -Uri "http://localhost:8000/api/campaigns/generate?event_id=$eventId" `
  -Headers @{"Content-Type"="application/json"} -UseBasicParsing

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Result:** 3 variations generated per platform ✅

---

# ✅ VERIFICATION CHECKLIST

Complete each item:

### Credentials Collected
- [ ] credentials.json in project root
- [ ] Calendar ID saved
- [ ] Gemini API key saved
- [ ] Gmail app password saved (NOT regular password!)
- [ ] LinkedIn access token saved

### Configuration
- [ ] .env file created
- [ ] All placeholders replaced with real credentials
- [ ] .env saved in project root

### Backend Running
- [ ] Backend starts without errors
- [ ] All services show ✓ on startup
- [ ] http://localhost:8000/health returns OK

### Integrations Status
- [ ] GET /api/integrations/status returns all configured=true
- [ ] No error messages in logs

### Workflow Test
- [ ] test_full_workflow.ps1 completes successfully
- [ ] All 4 tests pass (calendar, gemini, email, linkedin)

### Manual Verification
- [ ] Email received in inbox
- [ ] LinkedIn post visible on feed
- [ ] Google Calendar events showing
- [ ] Content variations generated

---

# 🎉 SUCCESS!

Your Aevum AI system is now:
- ✅ Connected to real Google Calendar
- ✅ Using real Gemini AI for content
- ✅ Sending real emails via Gmail SMTP
- ✅ Posting to real LinkedIn

## What's Next?

1. **Monitor the Dashboard**
   ```powershell
   npm run dev
   # Visit http://localhost:3000
   ```

2. **Test Content Approval Flow**
   - Generate content → Approve → Send

3. **Enable Auto-Scheduling**
   - Already set: `SCHEDULER_ENABLED=True`
   - System generates content every 6 hours

4. **Track Analytics**
   - Email opens and clicks
   - LinkedIn engagement
   - Campaign performance

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `credentials.json not found` | Save Google Cloud JSON to project root |
| `GOOGLE_CALENDAR_ID invalid` | Get from Calendar Settings → Calendar ID |
| `Email auth fails` | Use 16-char APP PASSWORD, not Gmail password |
| `LinkedIn returns 401` | Token expired (valid 60 days) - regenerate |
| `Gemini returns errors` | Verify API key copied exactly from Google AI Studio |
| `Port 8000 in use` | Change to `--port 8001` or kill existing process |
| `No events showing` | Add events to your Google Calendar first |

---

## 📞 Quick Support

**Backend won't start?**
```powershell
cd backend
python -m pip install -r ../requirements.txt
```

**Need fresh database?**
```powershell
Remove-Item aevum_ai.db -Force
python database.py
```

**View logs?**
```powershell
# All backend output is in the terminal window
```

---

**🚀 YOUR SYSTEM IS LIVE AND READY FOR PRODUCTION** 🚀

