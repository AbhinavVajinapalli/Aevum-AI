# 🚀 Deployment Ready Checklist

**Status**: ✅ Frontend application is deployment-ready  
**Build Status**: ✅ Passing (Next.js 16.2.4, Turbopack)  
**Lint Status**: ✅ Passing (0 errors, 1 warning in config only)  
**Last Updated**: May 6, 2026

---

## ✅ Completed Setup

- [x] Landing page created (`/` route)
- [x] Privacy Policy page created (`/privacy` route)
- [x] Terms & Conditions page created (`/terms` route)
- [x] Dashboard authentication guard implemented
- [x] LinkedIn OAuth integration (PKCE flow)
- [x] Google Calendar integration configured
- [x] Email notification service configured
- [x] Gemini AI content generation integrated
- [x] Frontend build passing
- [x] ESLint validation passing

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Ensure all these variables are in your production `.env` file:

```
# LinkedIn Integration
LINKEDIN_CLIENT_ID=YOUR_CLIENT_ID
LINKEDIN_CLIENT_SECRET=YOUR_CLIENT_SECRET
LINKEDIN_REDIRECT_URI=https://YOUR_FRONTEND_URL/dashboard
LINKEDIN_SCOPES=openid profile email w_member_social
LINKEDIN_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
LINKEDIN_AUTHOR_URN=  # Leave empty initially, populate with org URN after approval

# Google Calendar & Gemini
GOOGLE_CALENDAR_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALENDAR_REDIRECT_URI=https://YOUR_FRONTEND_URL/dashboard

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=2303a52486@sru.edu.in
SMTP_PASSWORD=YOUR_APP_PASSWORD
SMTP_FROM_EMAIL=2303a52486@sru.edu.in
SMTP_FROM_NAME=Aevum AI

# Application Defaults
NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL=2303a52486@sru.edu.in
NEXT_PUBLIC_FRONTEND_URL=https://YOUR_FRONTEND_URL
NEXT_PUBLIC_BACKEND_URL=https://YOUR_BACKEND_URL
DATABASE_URL=sqlite:///aevum_ai.db  # For local dev; use managed DB for production
```

### 2. LinkedIn App Configuration

Update your LinkedIn app settings at https://www.linkedin.com/developers/apps:

**General Settings:**
- Application name: Aevum AI
- Application website URL: `https://YOUR_FRONTEND_URL`
- Legal agreement: Check acceptance

**Redirect URLs (OAuth 2.0):**
- Add: `https://YOUR_FRONTEND_URL/dashboard`
- Add: `https://YOUR_BACKEND_URL/api/integrations/linkedin/oauth/callback`

**Privacy Policy & Terms:**
- Privacy Policy URL: `https://YOUR_FRONTEND_URL/privacy`
- Terms & Conditions URL: `https://YOUR_FRONTEND_URL/terms`

**Product Requests (Apply For):**
- [x] Sign In with LinkedIn using OpenID Connect
- [ ] Share on LinkedIn (for org posting capability)
- [ ] Community Management API (optional)
- [ ] Pages Data Portability (optional)

---

## 🌐 Frontend Deployment (Vercel)

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure project
```

### Option B: Deploy via GitHub (Recommended)

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Aevum AI MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/aevum-ai.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Select GitHub
   - Import `aevum-ai` repository
   - Configure project:
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
     - **Environment Variables**: Add all variables from section 1

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy main branch

### Production URLs After Deployment:
- Frontend: `https://aevum-ai.vercel.app` (or custom domain)
- Update `NEXT_PUBLIC_FRONTEND_URL` in environment variables

---

## 🐍 Backend Deployment (Render or Railway)

### Option A: Deploy to Render

1. **Create Render Account:**
   - Go to https://render.com
   - Connect GitHub account

2. **Create New Web Service:**
   - Select GitHub repository
   - **Name**: aevum-ai-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free or Paid

3. **Set Environment Variables:**
   - Add all variables from section 1
   - Click "Deploy"

### Option B: Deploy to Railway

1. **Connect GitHub:**
   - Go to https://railway.app
   - Import GitHub repo

2. **Configure:**
   - **Python Version**: 3.11
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

3. **Set Secrets:**
   - Add environment variables via Railway dashboard

### Production URLs After Deployment:
- Backend API: `https://aevum-ai-backend.onrender.com`
- Update `NEXT_PUBLIC_BACKEND_URL` in frontend environment

---

## 🔄 Database Migration

### Production Database Setup:

**Option 1: SQLite (Simple, suitable for MVP)**
- Database file: `aevum_ai.db` (persist in production)
- No additional setup needed

**Option 2: PostgreSQL (Recommended for scaling)**

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/aevum_ai
```

### Initialize Production Database:

```bash
# Run migrations (if using Alembic)
alembic upgrade head

# Or directly with SQLAlchemy
python -c "from backend.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

---

## 📝 Post-Deployment Steps

### 1. Verify Frontend Deployment
```bash
# Test landing page
curl https://YOUR_FRONTEND_URL

# Test privacy page
curl https://YOUR_FRONTEND_URL/privacy

# Test dashboard redirect (should redirect to login)
curl -L https://YOUR_FRONTEND_URL/dashboard
```

### 2. Verify Backend Deployment
```bash
# Test API health check
curl https://YOUR_BACKEND_URL/health

# Or via browser
https://YOUR_BACKEND_URL/docs  # Swagger UI
```

### 3. Test OAuth Flow
1. Visit `https://YOUR_FRONTEND_URL`
2. Click "Get Started" → Dashboard
3. Complete LinkedIn OAuth flow
4. Verify successful login and calendar sync

### 4. LinkedIn Product Approval
1. Submit product requests in LinkedIn app dashboard
2. Provide use case and screenshots
3. Wait for approval (typically 1-2 weeks)
4. Once approved: Get organization URN and update `LINKEDIN_AUTHOR_URN`

---

## 🔐 Security Checklist

- [ ] All environment variables are securely stored (never committed)
- [ ] `.env` file is in `.gitignore`
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured correctly for production domains
- [ ] Database credentials secured and not exposed
- [ ] API keys rotated before production deployment
- [ ] Rate limiting configured on backend
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled (Next.js built-in)
- [ ] CSRF tokens implemented for POST requests

---

## 🚨 Common Deployment Issues & Fixes

### Issue: OAuth Redirect URI Mismatch
**Solution**: Ensure redirect URI matches exactly in:
- LinkedIn app settings
- Backend `LINKEDIN_REDIRECT_URI` variable
- Frontend OAuth callback implementation

### Issue: CORS Errors
**Solution**: Update backend CORS configuration:
```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://YOUR_FRONTEND_URL"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Environment Variables Not Loading
**Solution**: 
- Verify variables are set in Vercel/Railway dashboard
- Restart deployment after updating env vars
- Use `NEXT_PUBLIC_` prefix for frontend-accessible vars

### Issue: Database Connection Error
**Solution**:
- Verify DATABASE_URL format
- Check network/firewall rules
- Ensure database is running and accessible

---

## 📊 Monitoring & Maintenance

### Frontend Monitoring
- Set up Vercel Analytics: https://vercel.com/analytics
- Monitor build times and errors
- Track Core Web Vitals

### Backend Monitoring
- Set up error tracking (Sentry)
- Monitor API response times
- Track database query performance
- Set up alerts for downtime

### Regular Tasks
- [ ] Monitor API usage and costs
- [ ] Review and rotate API keys monthly
- [ ] Update dependencies (npm, pip)
- [ ] Backup database regularly
- [ ] Monitor storage quotas

---

## 🎯 Next Steps (After Deployment)

1. **Create GitHub Repository** (user responsibility - coordinates with deployment)
2. **Request LinkedIn Product Approvals**:
   - Submit "Share on LinkedIn" product request
   - Provide use case: Event promotion automation
   - Include privacy policy URL and terms URL

3. **Set Up CI/CD Pipeline**:
   - Enable GitHub Actions for automated testing
   - Configure pre-deployment tests
   - Set up automatic deployments on main branch

4. **Monitor & Optimize**:
   - Track user analytics
   - Monitor performance metrics
   - Collect user feedback
   - Plan feature enhancements

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Deployment**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **LinkedIn Developer**: https://www.linkedin.com/developers
- **Google Calendar API**: https://developers.google.com/calendar

---

**Questions or Issues?** Contact: vajinapalli.abhinav@gmail.com
