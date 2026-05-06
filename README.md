# Aevum AI

AI-powered event publicity platform with a Next.js frontend and FastAPI backend.

## Repository Structure

- `frontend/` - Next.js app (UI, dashboard, pages, components)
- `backend/` - FastAPI API, integrations, services, agents

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
	  - `EMAIL_SENDER`
	  - `EMAIL_PASSWORD`
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
	- Edit `frontend/lib/api.ts`:
	  ```typescript
	  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
	  ```
	- Ensure frontend makes API calls to Render backend URL
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
- [ ] LinkedIn posting functional (verify org URN is set)
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

**CORS errors:**
- Backend `main.py` should allow frontend origin
- Example: `allow_origins=["https://YOUR_VERCEL_URL", "http://localhost:3000"]`

## Notes

- `node_modules`, local DB files, and secrets are ignored via `.gitignore`.
- Keep all deployable source under top-level `frontend/` and `backend/`.
