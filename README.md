# Aevum AI

AI-powered event publicity platform with a Next.js frontend and FastAPI backend.

## What It Does

Aevum AI helps teams promote events by generating channel-specific content, routing it through approvals, and publishing approved content through integrated delivery channels.

### Current Product Features

- Google Calendar sync for event ingestion.
- AI-assisted campaign and variation generation.
- Multi-platform content workflow (email, WhatsApp, LinkedIn drafts).
- Approval lifecycle support (`pending`, `approved`, and sent tracking).
- Dashboard cards for analytics, campaigns, and approval queues.
- Send actions from dashboard for approved Email and WhatsApp content.
- LinkedIn generation visible in workflow with UI-level `Coming soon` publishing state.
- Integration health visibility in dashboard (SMTP, Gemini, Calendar, LinkedIn).

## Repository Structure

- `frontend/` - Next.js app (UI, dashboard, pages, components)
- `backend/` - FastAPI API, integrations, services, agents

## Core Backend Endpoints

- `GET /api/events` - list synced events.
- `POST /api/campaigns/generate` - generate campaign content for an event.
- `GET /api/campaigns` - campaign summary and status breakdown.
- `GET /api/approvals/pending` - pending approval items.
- `GET /api/approvals/approved` - approved, unsent content ready to publish.
- `POST /api/content/{content_id}/publish/email` - send approved email content.
- `POST /api/content/{content_id}/publish/whatsapp` - send approved WhatsApp content.
- `GET /api/analytics` - dashboard analytics snapshot.
- `GET /api/integrations/status` - integration configuration/health status.

## Local Development

### 1) Backend

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2) Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## Environment Variables

Create environment files locally (do not commit secrets):

- Backend: `backend/.env`
- Frontend: `frontend/.env.local`

Add required keys for integrations such as LinkedIn OAuth, Google OAuth, Gemini, SMTP, and API base URLs.

New: Gmail API

- `GMAIL_CLIENT_ID` – OAuth2 Client ID for Gmail API
- `GMAIL_CLIENT_SECRET` – OAuth2 Client Secret for Gmail API
- `GMAIL_REFRESH_TOKEN` – Long-lived refresh token to mint access tokens
- `GMAIL_FROM_ADDRESS` – From address used when sending via Gmail API

## Production Deployment

### Backend Deployment on Render

1. **Create Render Account**
	- Go to https://render.com
	- Sign up with GitHub account
	- Grant repository access

2. **Create New Web Service**
	- Dashboard → "New +" → "Web Service"
	- Connect GitHub repository: `AbhinavVajinapalli/Aevum-AI`
	- Select repository

3. **Configure Service**
	- Name: `aevum-ai-backend`
	- Environment: `Python 3`
	- Region: `Oregon` (or closest to users)
	- Build Command: `pip install -r requirements.txt`
	- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
	- Instance Type: `Free` (or `Starter` for production)

4. **Set Environment Variables**
	- In Render dashboard, go to your service → "Environment"
	- Add all from `backend/.env`:
	  - `LINKEDIN_CLIENT_ID`
	  - `LINKEDIN_CLIENT_SECRET`
	  - `LINKEDIN_REDIRECT_URI` (set to: `https://YOUR_RENDER_URL/auth/linkedin/callback`)
	  - `LINKEDIN_AUTHOR_URN`
	  - `GOOGLE_CLIENT_ID`
	  - `GOOGLE_CLIENT_SECRET`
	  - `GEMINI_API_KEY`
		- `SMTP_USERNAME` and `SMTP_PASSWORD` (or the backward-compatible aliases `EMAIL_SENDER` and `EMAIL_PASSWORD`)
	  - `DATABASE_URL` (optional; defaults to SQLite)
	- Click "Deploy"

5. **Update LinkedIn OAuth**
	- Go to LinkedIn Developer Console
	- Update Authorized redirect URI to: `https://YOUR_RENDER_URL/auth/linkedin/callback`
	- Update Client ID/Secret in Render env if changed

6. **Test Backend**
	```bash
	curl https://YOUR_RENDER_URL/docs
	```
	Should return Swagger UI docs.

### Frontend Deployment on Vercel

1. **Create Vercel Account**
	- Go to https://vercel.com
	- Sign up with GitHub account
	- Grant repository access

2. **Import Project**
	- Dashboard → "Add New..." → "Project"
	- Import Git repository: `AbhinavVajinapalli/Aevum-AI`
	- Select repository

3. **Configure Build Settings**
	- Framework Preset: `Next.js`
	- Root Directory: `frontend/`
	- Build Command: `pnpm run build` (auto-filled if detected)
	- Output Directory: `.next` (auto-filled)
	- Install Command: `pnpm install` (auto-filled)

4. **Set Environment Variables**
	- In Vercel project settings → "Environment Variables"
	- Add:
	  - `NEXT_PUBLIC_API_BASE_URL`: `https://YOUR_RENDER_URL` (backend URL)
	  - Any other public variables needed by frontend
	- Click "Deploy"

5. **Update Frontend API Base URL**
	- Ensure frontend API base URL is set via environment variable:
	  ```typescript
	  NEXT_PUBLIC_API_BASE_URL=https://YOUR_RENDER_URL
	  ```
	- Frontend API helpers resolve this and call backend endpoints through `frontend/lib/backend.ts`.
	- Commit and push; Vercel auto-deploys

6. **Test Frontend**
	- Visit `https://YOUR_VERCEL_URL`
	- Dashboard should load and authenticate via backend

### Post-Deployment Checklist

- [ ] Backend API responds at `https://YOUR_RENDER_URL/docs`
- [ ] Frontend loads at `https://YOUR_VERCEL_URL`
- [ ] OAuth flow works (LinkedIn/Google login)
- [ ] Dashboard displays after login
- [ ] Campaign/event creation works
- [ ] Email and WhatsApp send buttons work for approved items

Notes about notifications UI:
- Notification state is persisted in browser `localStorage` so clearing or marking as read now persists across page reloads/local navigation.
- [ ] LinkedIn content generation appears in dashboard/cards (publishing remains coming soon)
- [ ] Database persists data (check Render logs)
- [ ] Error logs accessible (Render Logs tab, Vercel error logs)

### Troubleshooting

**Backend fails to deploy:**
- Check `backend/requirements.txt` exists and is parseable
- Check start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- View Render logs for Python errors

**Frontend build fails:**
- Ensure `frontend/package.json` exists
- Check `pnpm-lock.yaml` is current
- Verify no hardcoded `http://localhost` URLs

**OAuth fails after deployment:**
- Update redirect URIs in OAuth provider console
- Verify env vars set in hosting platform
- Check frontend `NEXT_PUBLIC_API_BASE_URL` points to correct backend

**Email publishing fails with SMTP errors:**
- Set `SMTP_USERNAME` and `SMTP_PASSWORD` in Render
- Older deployments can also use `EMAIL_SENDER` and `EMAIL_PASSWORD`
- Restart the backend after updating mail credentials

**CORS errors:**
- Backend `main.py` should allow frontend origin
- Example: `allow_origins=["https://YOUR_VERCEL_URL", "http://localhost:3000"]`

## Notes

- `node_modules`, local DB files, and secrets are ignored via `.gitignore`.
- Keep all deployable source under top-level `frontend/` and `backend/`.
