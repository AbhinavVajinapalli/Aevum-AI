# 🔐 Complete Credential Setup Guide for Aevum AI

This guide walks you through setting up **Google Calendar**, **Gemini**, **SMTP (Email)**, and **LinkedIn** credentials step-by-step.

---

## ✅ STEP 1: Set Up Google Calendar

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** (top left)
3. Click **NEW PROJECT**
4. Name: `Aevum AI`
5. Click **CREATE**
6. Wait 1-2 minutes for project to be created

### 1.2 Enable Required APIs
1. In the left sidebar, click **APIs & Services** → **Enabled APIs & services**
2. Click **+ ENABLE APIS AND SERVICES**
3. Search for **Google Calendar API**
   - Click it
   - Click **ENABLE**
4. Repeat for **Gmail API** (for SMTP)
   - Click **+ ENABLE APIS AND SERVICES**
   - Search **Gmail API**
   - Click **ENABLE**

### 1.3 Create OAuth2 Credentials (Recommended for Render: Web Application)
1. Go to **APIs & Services** -> **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS**
3. Choose **OAuth 2.0 Client IDs**
4. If asked to create consent screen first:
   - Click **Configure Consent Screen**
   - User Type: **External**
   - Click **CREATE**
   - Fill in:
     - **App name**: Aevum AI
     - **User support email**: your email
     - **Developer contact**: your email
   - Click **SAVE AND CONTINUE**
   - Click **SAVE AND CONTINUE** again (skip scopes)
   - Click **SAVE AND CONTINUE** again (skip test users)
   - Click **BACK TO DASHBOARD**

5. Back in Credentials, click **+ CREATE CREDENTIALS**
   - Choose **OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Name: `Aevum AI Web`
   - Add these Authorized redirect URIs (important for OAuth Playground):
     - `https://developers.google.com/oauthplayground`
     - `http://localhost:8080/oauth2callback` (for local testing)
   - Click **CREATE**

6. Copy and save these values for `.env`:
   - **Client ID** -> `GOOGLE_CLIENT_ID`
   - **Client Secret** -> `GOOGLE_CLIENT_SECRET`

7. Download JSON only if you also want local interactive fallback, then save as:
   ```
   C:\Users\Abhi\Documents\Aevum AI\credentials.json
   ```

> **Why Web app for Render?** Render is a deployed backend and cannot use popup/local browser login flow reliably at runtime.

### 1.4 Get Your Google Calendar ID
1. Go to [Google Calendar](https://calendar.google.com)
2. On the left side, find your calendar (usually "Calendar" or your email)
3. Click the **⋮** (three dots) next to it
4. Click **Settings**
5. Scroll down to find **Calendar ID** (looks like: `abc123@group.calendar.google.com`)
6. Copy this ID - you'll need it in Step 5

### 1.5 Generate a Refresh Token (Required for Render)
Use Google OAuth Playground to get a long-lived refresh token:

**Important: Make sure Step 1.3 is complete with both redirect URIs added before proceeding.**

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in the top-right corner:
   - Check box: **Use your own OAuth credentials**
   - Paste your **GOOGLE_CLIENT_ID** from Step 1.3
   - Paste your **GOOGLE_CLIENT_SECRET** from Step 1.3
   - Click **Close**
3. In the left panel (Step 1), find the input box and paste this scope:
   ```
   https://www.googleapis.com/auth/calendar.readonly
   ```
4. Click **Authorize APIs**
5. A popup opens — select your Google account and approve the permissions
6. Click **Exchange authorization code for tokens** (Step 2 on right)
7. Copy the **Refresh token** value and save it as `GOOGLE_REFRESH_TOKEN` in your `.env`

---

## ✅ STEP 2: Set Up Google Gemini API

### 2.1 Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click **Create API Key**
3. A popup shows your key - **COPY IT IMMEDIATELY**
4. Save it somewhere safe (you'll add it to .env in Step 5)

> **Note:** This is free tier! Generous limits for development.

---

## ✅ STEP 3: Set Up SMTP (Email)

You have two options:

### OPTION A: Gmail (Recommended & Easiest)

1. **Enable 2FA on your Gmail account** (if not already done):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click **2-Step Verification**
   - Follow steps to enable

2. **Create an App Password**:
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Device: `Other (custom name)` → Type: `Aevum AI`
   - Click **GENERATE**
   - Google shows a 16-character password - **COPY IT**
   - Save it (you'll use this as SMTP_PASSWORD in Step 5)

3. **Collect Gmail SMTP Details**:
   - **SMTP_SERVER**: `smtp.gmail.com`
   - **SMTP_PORT**: `587`
   - **SMTP_USERNAME**: Your Gmail address (e.g., `your.email@gmail.com`)
   - **SMTP_PASSWORD**: The 16-character app password you just got
   - **TEAM_EMAIL**: Your Gmail address
   - **EMAIL_FROM_NAME**: `Aevum AI` (or your name)

### OPTION B: Other Email Provider (e.g., Outlook, corporate email)
Contact your email provider for SMTP settings. Usually found in email settings/security.

---

## ✅ STEP 4: Set Up LinkedIn

### 4.1 Get LinkedIn Access Token
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create app**
3. Fill in:
   - **App name**: `Aevum AI`
   - **LinkedIn Page**: Create or select an existing page
   - **App logo**: Upload any image
   - **Legal agreement**: Check the box
   - Click **CREATE APP**

4. Go to the **Auth** tab
5. Under **Authorized redirect URLs for your app**, add:
   - Local development: `http://localhost:8000/api/integrations/linkedin/oauth/callback`
   - Render production: `https://YOUR-RENDER-SERVICE.onrender.com/api/integrations/linkedin/oauth/callback`
6. Save the changes
7. Use the backend endpoint to start OAuth:
   - `GET /api/integrations/linkedin/oauth/start`
   - Copy the returned `authorization_url` and open it in your browser
8. After LinkedIn redirects back, copy the `access_token` from the callback response and save it as `LINKEDIN_ACCESS_TOKEN` for Step 5

> **Note:** The exact redirect URL your app uses is `http://localhost:8000/api/integrations/linkedin/oauth/callback` locally, or `https://YOUR-RENDER-SERVICE.onrender.com/api/integrations/linkedin/oauth/callback` in production.

---

## ✅ STEP 5: Create `.env` File

Now create your `.env` file with all credentials:

1. Open a text editor (Notepad, VS Code, etc.)
2. Copy and paste the template below
3. **Replace** `YOUR_XXXXX` with your actual credentials from Steps 1-4
4. Save as **`.env`** in your project root:
   ```
   C:\Users\Abhi\Documents\Aevum AI\.env
   ```

### `.env` Template:
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

# Production-safe Google OAuth (Render/Railway)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=YOUR_GOOGLE_REFRESH_TOKEN
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
ALLOW_INTERACTIVE_OAUTH=False

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

### Example (with fake data):
```env
GOOGLE_CALENDAR_ID=student.events@group.calendar.google.com
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxx
SMTP_USERNAME=your.email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
LINKEDIN_ACCESS_TOKEN=AQXxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ STEP 6: Test Backend Startup

### 6.1 Install Dependencies
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI"
python -m pip install -r requirements.txt
```

### 6.2 Initialize Database
```powershell
cd backend
python database.py
cd ..
```

Output should show: `✓ Database initialized`

### 6.3 Start Backend
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ Google Calendar authenticated
✓ Email service initialized
✓ LinkedIn service ready
```

If you see these ✓ marks, **ALL CREDENTIALS ARE WORKING!**

---

## ✅ STEP 7: Verify Full Live Workflow

### 7.1 Test Calendar Sync
Open a new PowerShell window and run:
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI"
Invoke-WebRequest http://localhost:8000/api/events
```

**Expected response:** JSON with your upcoming events from Google Calendar

### 7.2 Test Event Analysis & Content Generation
```powershell
$body = @{
    title = "Tech Conference 2026"
    description = "Annual developer conference featuring AI and cloud technologies"
    start_time = "2026-05-15T09:00:00Z"
    end_time = "2026-05-15T17:00:00Z"
    event_type = "conference"
} | ConvertTo-Json

Invoke-WebRequest -Method POST `
  -Uri http://localhost:8000/api/campaigns/generate `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected response:** Campaign with 3 content variations + Gemini analysis

### 7.3 Test Email Sending (Draft)
```powershell
$body = @{
    content_id = "test-email"
    platform = "email"
    content = "Join us for Tech Conference 2026!"
    recipient_email = "YOUR_EMAIL@gmail.com"
} | ConvertTo-Json

Invoke-WebRequest -Method POST `
  -Uri http://localhost:8000/api/campaigns/send `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

Check your email inbox - **you should receive the test email!**

### 7.4 Test LinkedIn Post (Draft)
```powershell
$body = @{
    content_id = "test-linkedin"
    platform = "linkedin"
    content = "🎉 Tech Conference 2026 is coming! Join us for amazing talks on AI and cloud technologies. #TechConf #AI"
} | ConvertTo-Json

Invoke-WebRequest -Method POST `
  -Uri http://localhost:8000/api/campaigns/send `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected response:** LinkedIn post ID or confirmation message

---

## ✅ STEP 8: Full End-to-End Workflow Test

Run this comprehensive test script:

```powershell
# File: test_full_workflow.ps1

$baseUrl = "http://localhost:8000"

Write-Host "=== AEVUM AI FULL WORKFLOW TEST ===" -ForegroundColor Cyan

# 1. Fetch events
Write-Host "`n1️⃣  Testing Calendar Integration..." -ForegroundColor Green
$events = Invoke-WebRequest "$baseUrl/api/events" | ConvertFrom-Json
Write-Host "✓ Retrieved $(($events | Measure-Object).Count) events" -ForegroundColor Green

# 2. Generate campaign for first event
if ($events.Count -gt 0) {
    $event = $events[0]
    Write-Host "`n2️⃣  Testing Content Generation (Gemini)..." -ForegroundColor Green
    
    $body = @{
        title = $event.title
        description = $event.description
        start_time = $event.start_time
        end_time = $event.end_time
        event_type = "conference"
    } | ConvertTo-Json
    
    $campaign = Invoke-WebRequest -Method POST `
      -Uri "$baseUrl/api/campaigns/generate" `
      -Headers @{"Content-Type"="application/json"} `
      -Body $body | ConvertFrom-Json
    
    Write-Host "✓ Generated campaign with $(($campaign.variations | Measure-Object).Count) variations" -ForegroundColor Green
    
    # 3. Test email send
    Write-Host "`n3️⃣  Testing Email (SMTP)..." -ForegroundColor Green
    $emailBody = @{
        content_id = "workflow-test-email"
        platform = "email"
        content = $campaign.variations[0].variation_1
        recipient_email = $env:SMTP_USERNAME
    } | ConvertTo-Json
    
    $emailResult = Invoke-WebRequest -Method POST `
      -Uri "$baseUrl/api/campaigns/send" `
      -Headers @{"Content-Type"="application/json"} `
      -Body $emailBody | ConvertFrom-Json
    
    Write-Host "✓ Email test result: $($emailResult.message)" -ForegroundColor Green
    
    # 4. Test LinkedIn post
    Write-Host "`n4️⃣  Testing LinkedIn Integration..." -ForegroundColor Green
    $linkedinBody = @{
        content_id = "workflow-test-linkedin"
        platform = "linkedin"
        content = $campaign.variations[1].variation_2
    } | ConvertTo-Json
    
    $linkedinResult = Invoke-WebRequest -Method POST `
      -Uri "$baseUrl/api/campaigns/send" `
      -Headers @{"Content-Type"="application/json"} `
      -Body $linkedinBody | ConvertFrom-Json
    
    Write-Host "✓ LinkedIn test result: $($linkedinResult.message)" -ForegroundColor Green
    
    Write-Host "`n✅ ALL SYSTEMS OPERATIONAL!" -ForegroundColor Cyan
    Write-Host "Your Aevum AI is fully configured and working!" -ForegroundColor Cyan
}
```

Save this as **`test_full_workflow.ps1`** in your project root and run:
```powershell
.\test_full_workflow.ps1
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Error 400: redirect_uri_mismatch` | Make sure you added `https://developers.google.com/oauthplayground` to Authorized redirect URIs in Step 1.3 |
| `FileNotFoundError: credentials.json` | Download credentials.json from Google Cloud Console (Step 1.3) and save to project root |
| `GOOGLE_CALENDAR_ID not found` | Get your calendar ID from Google Calendar settings (Step 1.4) |
| `Gmail says "Incorrect password"` | Use the 16-character **app password**, not your Gmail password (Step 3) |
| `LinkedIn token expired` | Generate a new token from LinkedIn Developers (Step 4.1) |
| `SMTP connection timeout` | Check if SMTP_SERVER and SMTP_PORT are correct; Gmail uses port 587 |
| `Gemini returning errors` | Verify API key in .env matches exactly what you copied from Google AI Studio |

---

## 📋 Quick Checklist

Before running the workflow, verify you have:

- [ ] `credentials.json` in project root
- [ ] `.env` file in project root with all credentials
- [ ] `GOOGLE_CALENDAR_ID` set correctly
- [ ] `GEMINI_API_KEY` set correctly  
- [ ] Gmail app password (not regular password) in `SMTP_PASSWORD`
- [ ] LinkedIn access token in `LINKEDIN_ACCESS_TOKEN`
- [ ] Backend running on port 8000
- [ ] Database initialized (`aevum_ai.db` exists)

Once all checked, your system is **LIVE and READY!** 🚀

