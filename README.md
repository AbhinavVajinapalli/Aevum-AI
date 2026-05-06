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

Recommended split deployment:

- Frontend: Vercel (or Netlify) from `frontend/`
- Backend: Render/Railway/Fly.io from `backend/`

Set production environment variables in each hosting platform, then point frontend API base URL to deployed backend URL.

## Notes

- `node_modules`, local DB files, and secrets are ignored via `.gitignore`.
- Keep all deployable source under top-level `frontend/` and `backend/`.
