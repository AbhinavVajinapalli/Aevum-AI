# ✅ Aevum AI - Verification & Testing Commands

## 🚀 Start the Backend (Copy-Paste Ready)

### Windows PowerShell
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI\backend"
python -m uvicorn main:app --reload --port 8000
```

### Windows Command Prompt
```cmd
cd C:\Users\Abhi\Documents\Aevum AI\backend
python -m uvicorn main:app --reload --port 8000
```

### Linux/Mac Terminal
```bash
cd ~/Documents/Aevum\ AI/backend
python -m uvicorn main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

## 🧪 Test Endpoints (After Backend Starts)

### 1. Browser Swagger UI (EASIEST)
```
http://localhost:8000/docs
```
**Action**: Open in any browser, try endpoints directly with UI

---

### 2. PowerShell/Terminal Commands

#### Health Check
```powershell
Invoke-WebRequest http://localhost:8000/health -UseBasicParsing | % { $_.Content | ConvertFrom-Json | ConvertTo-Json }
```

**Expected Output**:
```json
{
  "status": "ok",
  "app": "Aevum AI - Event Publicity Agent",
  "version": "0.1.0"
}
```

---

#### Get Events
```powershell
Invoke-WebRequest http://localhost:8000/api/events -UseBasicParsing | % { $_.Content | ConvertFrom-Json | ConvertTo-Json }
```

**Expected Output** (3 mock events):
```json
[
  {
    "id": "mock_1",
    "title": "Python Workshop - Advanced Topics",
    "event_type": "workshop",
    "lifecycle_stage": "pre_event",
    "urgency_score": 8,
    ...
  },
  ...
]
```

---

#### Generate Content (Requires Gemini API Key)
```powershell
$response = Invoke-WebRequest -Method POST "http://localhost:8000/api/campaigns/generate?event_id=mock_1" -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Output**:
```json
{
  "status": "success",
  "campaign_id": "camp_xyz123",
  "agent_analysis": {
    "event_analysis": "...",
    "platforms": ["email", "linkedin"],
    "variations": [...]
  },
  "content_ids": ["cont_abc", "cont_def", "cont_ghi"],
  "message": "Generated content with 6 variations across 2 platforms"
}
```

---

#### Get Campaign Details
```powershell
# First get a campaign_id from the generate response above
$campaignId = "camp_xyz123"
Invoke-WebRequest "http://localhost:8000/api/campaigns/$campaignId" -UseBasicParsing | % { $_.Content | ConvertFrom-Json | ConvertTo-Json }
```

---

#### Approve Content
```powershell
$contentId = "cont_abc"
$response = Invoke-WebRequest -Method POST "http://localhost:8000/api/approvals?content_id=$contentId&approved_by=team@university.edu" -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

#### Get Analytics
```powershell
Invoke-WebRequest http://localhost:8000/api/analytics -UseBasicParsing | % { $_.Content | ConvertFrom-Json | ConvertTo-Json }
```

**Expected Output**:
```json
{
  "total_events": 3,
  "total_campaigns": 1,
  "approved_content": 1,
  "pending_content": 5,
  "content_sent": 0,
  "approval_rate": "16.7%",
  "platform_breakdown": {
    "email": 3,
    "linkedin": 3
  }
}
```

---

### 3. cURL Commands (Linux/Mac)

```bash
# Health check
curl http://localhost:8000/health

# Get events
curl http://localhost:8000/api/events

# Generate content
curl -X POST "http://localhost:8000/api/campaigns/generate?event_id=mock_1"

# Get analytics
curl http://localhost:8000/api/analytics
```

---

## 🔍 Verify Project Structure

### List All Project Files
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI"
Get-ChildItem -Recurse -Include "*.py", "*.md", "*.txt" | Select-Object FullName
```

---

### Check Database Exists
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI"
Test-Path aevum_ai.db
# Should return: True
```

---

### Check Database Has Tables
```powershell
$dbPath = "C:\Users\Abhi\Documents\Aevum AI\aevum_ai.db"
$cs = "Data Source=$dbPath"
$conn = New-Object System.Data.SQLite.SQLiteConnection $cs
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT name FROM sqlite_master WHERE type='table'"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) { Write-Host $reader["name"] }
$conn.Close()
```

**Expected Output**:
```
events
campaigns
generated_content
approvals
analytics
```

---

## 🧬 Verify Backend Modules Load

```powershell
cd "C:\Users\Abhi\Documents\Aevum AI\backend"
python -c "
from config import config
from database import init_db
from app.agents import EventPublicityAgent
from app.services import CalendarService
print('✓ All backend modules loaded successfully!')
print(f'✓ App: {config.APP_NAME}')
print(f'✓ Version: {config.APP_VERSION}')
print('✓ Backend is ready to run!')
"
```

**Expected Output**:
```
✓ All backend modules loaded successfully!
✓ App: Aevum AI - Event Publicity Agent
✓ Version: 0.1.0
✓ Backend is ready to run!
```

---

## 📊 Performance Test

```powershell
# This measures how fast the API responds

$url = "http://localhost:8000/api/events"
$times = @()

for ($i = 1; $i -le 10; $i++) {
    $start = Get-Date
    $response = Invoke-WebRequest $url -UseBasicParsing
    $end = Get-Date
    $time = ($end - $start).TotalMilliseconds
    $times += $time
    Write-Host "Request $i : ${time}ms"
}

$avg = ($times | Measure-Object -Average).Average
Write-Host "`nAverage response time: ${avg}ms"
```

**Expected Result**: <100ms per request

---

## 🔐 Verify Configuration

```powershell
cd "C:\Users\Abhi\Documents\Aevum AI"
type .env | Select-String -Pattern "^[A-Z_]*=" | % { Write-Host $_ }
```

**Expected Output** (lines from .env file):
```
GEMINI_API_KEY=...
GOOGLE_CALENDAR_ID=...
SMTP_USERNAME=...
...
```

---

## 🐛 Debug / Logs

### Enable Debug Logging
```powershell
cd "C:\Users\Abhi\Documents\Aevum AI\backend"
python -m uvicorn main:app --reload --port 8000 --log-level debug
```

### Check Python Version
```powershell
python --version
# Expected: Python 3.9+ (we're on 3.14.3, perfect!)
```

### Verify All Dependencies
```powershell
python -m pip list | Select-String -Pattern "fastapi|uvicorn|google|pydantic"
```

---

## 🚨 Troubleshooting Checklist

### If Backend Won't Start
```powershell
# 1. Check Python works
python --version

# 2. Check imports
cd backend
python -c "import fastapi; print('FastAPI OK')"

# 3. Check database
python database.py

# 4. Try different port
python -m uvicorn main:app --port 8001
```

### If API Endpoint Returns Error
```powershell
# Check error in terminal where backend is running
# Common issues:
# - Database not initialized: Run "python database.py"
# - Port in use: Use different port (--port 8001)
# - Missing dependency: Run "pip install -r requirements.txt"
```

### If Agent Returns Generic Response
```
This is normal if:
- Gemini API key not set
- No internet connection
- API quota exceeded

The system falls back to mock responses automatically!
```

---

## 📈 Load Test

```powershell
# Generate 5 campaigns simultaneously (stress test)

$eventId = "mock_1"
$urls = @("http://localhost:8000/api/campaigns/generate?event_id=$eventId") * 5

$jobs = @()
foreach ($url in $urls) {
    $job = Start-Job -ScriptBlock {
        param($url)
        Measure-Command {
            Invoke-WebRequest -Method POST $url -UseBasicParsing
        }
    } -ArgumentList $url
    $jobs += $job
}

Get-Job | Wait-Job
Get-Job | Receive-Job
```

---

## ✨ Success Indicators

Check all of these to confirm everything is working:

- [x] **Swagger UI loads** → Visit http://localhost:8000/docs
- [x] **Health check passes** → GET /health returns status: "ok"
- [x] **Events endpoint works** → GET /api/events returns mock events
- [x] **Campaign generation works** → POST /api/campaigns/generate returns variations
- [x] **Database has data** → Check aevum_ai.db has 5 tables
- [x] **No import errors** → Python imports load without errors
- [x] **Config loads** → .env file is read correctly
- [x] **Agent initializes** → EventPublicityAgent class instantiates

**If all ✓, you're ready for Day 2!**

---

## 📊 Expected Response Times

| Endpoint | Time | Notes |
|----------|------|-------|
| `/health` | <10ms | Instant |
| `/api/events` | <20ms | Database query |
| `/api/campaigns/generate` | 2-5s | Calls Gemini LLM (with key) |
| `/api/campaigns/generate` | <500ms | Fallback (no key) |
| `/api/approvals` | <50ms | Database write |
| `/api/analytics` | <30ms | Aggregation query |

---

## 🎓 Next Steps After Verification

1. ✅ **Verify backend works** (you're here)
2. 📝 **Read through code** (especially event_publicity_agent.py)
3. 🔧 **Add email integration** (Day 2)
4. 🔄 **Add scheduler** (Day 3)
5. ⚛️ **Build React frontend** (Day 4)

---

## 🎉 Congratulations!

If all tests pass, you have a **production-ready agentic AI backend** with:
- ✅ 10+ working API endpoints
- ✅ Intelligent decision-making agent
- ✅ SQLite database with 5 tables
- ✅ Mock data for testing
- ✅ Professional code structure
- ✅ Full API documentation

**Ready to add more features!** 🚀
