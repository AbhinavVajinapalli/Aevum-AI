# Render Deployment Environment Setup

## Overview
Your Aevum AI backend is deployed on Render, but environment variables need to be configured in the Render dashboard for integrations to work properly. The `.env` file is **not** deployed—only environment variables set in Render's dashboard are active in production.

## Critical Issue: Gemini API Not Working
**Problem**: Logs show `⚠ google-generativeai library not imported`  
**Root Cause**: `GEMINI_API_KEY` is not set in Render environment variables  
**Solution**: Add it to Render dashboard (steps below)

## Step-by-Step Setup

### 1. Log in to Render Dashboard
1. Go to https://dashboard.render.com
2. Find your **aevum-ai** backend service
3. Click on the service to open its settings

### 2. Navigate to Environment Variables
- Click the **"Environment"** tab on the left sidebar
- Scroll to **"Environment Variables"** section

### 3. Add Required Environment Variables

Copy each variable from your `.env` file and add it to Render:

#### **Google Calendar (Already Working)**
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REFRESH_TOKEN=<your-google-refresh-token>
GOOGLE_CALENDAR_ID=<your-google-calendar-id>
```
> Get these values from your `.env` file (lines 6-8)

#### **Gemini API (REQUIRED - Currently Missing)**
```
GEMINI_API_KEY=<your-gemini-api-key>
```
⚠️ **Add this immediately to fix content generation**  
> Get this value from your `.env` file (line 11)

#### **Email (SMTP)**
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your-smtp-username>
SMTP_PASSWORD=<your-smtp-password>
EMAIL_FROM_NAME=Aevum AI
```
> Get credentials from your `.env` file (lines 16-17)

#### **LinkedIn (For Publishing)**
```
LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-client-secret>
LINKEDIN_ACCESS_TOKEN=<your-linkedin-access-token>
LINKEDIN_AUTHOR_URN=urn:li:organization:<your-org-id>
```
> Get credentials from your `.env` file (lines 23-25)

#### **Application Config**
```
APP_NAME=Aevum AI - Event Publicity Agent
APP_VERSION=1.0.0
DEBUG=False
LOG_LEVEL=INFO
ALLOW_DEMO_MODE=False
DATABASE_URL=sqlite:///./aevum_ai.db

SCHEDULER_ENABLED=True
SCHEDULER_INTERVAL_HOURS=6

CORS_ORIGINS=["https://aevum-ai.onrender.com", "http://localhost:3000"]
```

### 4. Save and Deploy

1. After adding/updating all variables, click **"Save"** at the bottom
2. Render will automatically restart the service with new environment variables
3. Monitor the **"Logs"** tab to verify startup:
   - You should see `✓ Gemini API key configured` (instead of ⚠️ warning)
   - You should see `✓ Calendar sync scheduled every 3 hours`
   - You should see `✓ Synced X events from Google Calendar`

## Verification Steps

### 1. Check Startup Logs
```
✓ Google Calendar authenticated
✓ Gemini API key configured          ← Should see this now
✓ Loaded Gemini model: gemini-1.5-flash
✓ Database initialized at /opt/render/project/src/aevum_ai.db
✓ Synced 4 events from Google Calendar
✓ Calendar sync scheduled every 3 hours  ← NEW: Scheduled sync job
✓ Scheduler started - auto-generate every 6 hours
```

### 2. Test Gemini API
Once deployed, test content generation:
```bash
curl https://aevum-ai.onrender.com/api/campaigns/generate?event_id=<event_id>
```

Expected response: 200 with generated campaign data (not error)

### 3. Verify Event Auto-Sync
- Events should auto-sync every 3 hours (no redeploy needed)
- Check logs for: `[HH:MM:SS] Running calendar sync job...`
- New Google Calendar events will appear within 3 hours

## Troubleshooting

### "⚠ google-generativeai library not imported"
- **Cause**: GEMINI_API_KEY not set in Render
- **Fix**: Add `GEMINI_API_KEY` from `.env` to Render environment

### "GEMINI_API_KEY not set"
- **Cause**: GEMINI_API_KEY is empty/blank
- **Fix**: Use correct key: `AIzaSyA19ty_rV6217EpJIrAardAS_mWLtDW2T8`

### Events still not auto-syncing
- **Cause**: Scheduler job not running
- **Fix**: Check logs for `Running calendar sync job...` every 3 hours
- **Verify**: `SCHEDULER_ENABLED=True` is set

### Content generation returns error 500
- **Cause**: Gemini not initialized
- **Fix**: Ensure `GEMINI_API_KEY` is set correctly
- **Verify**: Look for `✓ Loaded Gemini model:` in startup logs

## What's Fixed

✅ **Separate Calendar Sync Job**: Now runs every 3 hours independently  
✅ **Event Auto-Refresh**: Events update without requiring redeploy  
✅ **Gemini Integration**: Ready to use once environment variable is set  
✅ **Scheduler Optimization**: Calendar sync + auto-generation now run on separate schedules  

## Next Steps

1. **Set all environment variables in Render dashboard** (above)
2. **Restart the backend service** (save triggers auto-restart)
3. **Monitor logs** for verification messages
4. **Test content generation** via API or dashboard
5. **Verify calendar sync** - check if new events appear within 3 hours

## Environment Variable Reference

| Variable | Source | Purpose |
|----------|--------|---------|
| `GEMINI_API_KEY` | `.env` line 11 | AI content generation (CRITICAL) |
| `GOOGLE_CLIENT_ID` | `.env` line 6 | Calendar authentication |
| `GOOGLE_CLIENT_SECRET` | `.env` line 7 | Calendar authentication |
| `GOOGLE_REFRESH_TOKEN` | `.env` line 8 | Calendar authentication |
| `SMTP_PASSWORD` | `.env` line 17 | Email sending |
| `LINKEDIN_ACCESS_TOKEN` | `.env` line 24 | LinkedIn publishing |
| `SCHEDULER_ENABLED` | `.env` line 36 | Enable background jobs |
| `SCHEDULER_INTERVAL_HOURS` | `.env` line 37 | Campaign generation interval |

---

**Deployed URL**: https://aevum-ai.onrender.com  
**Last Updated**: May 8, 2026
