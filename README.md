# Aevum AI — Product README

Concise overview and quick start. For detailed architecture, sequence diagrams, and rationale see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

What it is
---------

Aevum AI automates event publicity: fetch events from Google Calendar, generate platform-specific marketing drafts (email, LinkedIn, WhatsApp, Telegram), route them through an approval workflow, and publish approved content.

Quick features
--------------

- Calendar sync (Google Calendar)
- AI-powered draft generation with fallback
- Approval queue and bulk-approve
- Publish to Email (Gmail API / SMTP), LinkedIn, WhatsApp (Twilio), Telegram
- Dashboard with analytics and integration health

Quick start (local)
-------------------

Backend

```powershell
cd backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Environment

Create these local files (do not commit secrets):

- `backend/.env`
- `frontend/.env.local`

Key envvars: `NEXT_PUBLIC_API_BASE_URL`, `GEMINI_API_KEY`, Google/LinkedIn OAuth, SMTP/Gmail creds, Twilio, Telegram.

Deploy

- Backend: Render (start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- Frontend: Vercel (root: `frontend/`, set `NEXT_PUBLIC_API_BASE_URL`)

Need more?

- See full architecture, flows, and tradeoffs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
