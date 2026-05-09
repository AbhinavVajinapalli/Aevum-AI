# Email Sending Setup Guide - Complete Walkthrough

## Problem Summary
Email sending fails with 400 errors because:
1. **Content not approved** - Email endpoint requires `approval_status = 'approved'`
2. **SMTP credentials missing** - Render environment variables not configured
3. **Recipient not set** - No email recipient configured

## Solution: Complete Email Workflow

### Step 1: Approve Content Before Sending
**The Key Issue**: Email endpoint requires content to be `approved` first.

**Workflow**:
1. Go to Dashboard → Events
2. Expand an event
3. **Select content variation** (click on a draft)
4. Click **"Approve"** button
5. Once approved, the content status changes to `approved`
6. NOW you can send the email

### Step 2: Configure SMTP in Render Environment Variables

Go to https://dashboard.render.com → Aevum AI backend service → Environment tab

Add these variables:

#### Gmail Setup (Most Common)
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=Aevum AI
DEFAULT_ACCOUNT_EMAIL=your-email@gmail.com
```

**For your account:**
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=2303a52486@sru.edu.in
SMTP_PASSWORD=rqom yvgl ksbv dkup
EMAIL_FROM_NAME=Aevum AI
DEFAULT_ACCOUNT_EMAIL=2303a52486@sru.edu.in
```

⚠️ **Important**: 
- Use an **App Password**, NOT your regular Gmail password
- Go to https://myaccount.google.com/apppasswords to generate one
- Store it securely

#### Alternative: Custom Email Server
```
SMTP_SERVER=mail.yourdomain.com
SMTP_PORT=587  (or 465 for SSL)
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM_NAME=Your Company Name
DEFAULT_ACCOUNT_EMAIL=your-email@yourdomain.com
```

### Step 3: Send Email via API

#### Option A: Via Dashboard
1. Go to Dashboard → Events
2. Expand event and select content
3. Approve content (click "Approve" button)
4. **Look for "Send" or "Publish" button** (implementation may vary)
5. Enter recipient email if different from DEFAULT_ACCOUNT_EMAIL
6. Click Send

#### Option B: Via API (curl)
```bash
# First, approve the content
curl -X POST "https://aevum-ai.onrender.com/api/approvals?content_id=<CONTENT_ID>&approved_by=user" \
  -H "Content-Type: application/json"

# Then send email
curl -X POST "https://aevum-ai.onrender.com/api/content/<CONTENT_ID>/publish/email?recipient=user@example.com&use_html=true" \
  -H "Content-Type: application/json"
```

Replace:
- `<CONTENT_ID>` with actual content ID
- `user@example.com` with recipient email

### Step 4: Troubleshooting

#### "Content must be approved before sending" (400 error)
**Solution**: Click the "Approve" button first
- Navigate to Events
- Expand event
- Select draft content
- Click "Approve"

#### "SMTP is not configured" (400 error)
**Solution**: Set SMTP variables in Render
- Go to Render dashboard
- Add `SMTP_USERNAME` and `SMTP_PASSWORD`
- Click Save (service restarts)
- Try again

#### "No email recipient configured" (400 error)
**Solution**: Set DEFAULT_ACCOUNT_EMAIL
- Add to Render environment: `DEFAULT_ACCOUNT_EMAIL=your-email@gmail.com`
- Or pass `recipient=` parameter in API call

#### "Email send failed" (but no error)
**Solutions**:
- Check SMTP credentials are correct
- Verify Gmail App Password (not regular password)
- Check email is not in Spam folder
- Try sending a test email first

## Email Sending Workflow Diagram

```
1. Generate Campaign
   └─> Creates content in 'pending' status

2. Review & Approve
   └─> User clicks "Approve" button
   └─> Content status changes to 'approved'

3. Send Email
   └─> API receives approval
   └─> EmailService connects to SMTP
   └─> Email sent to recipient

4. Analytics
   └─> Success recorded in database
   └─> Email shows as 'sent' in dashboard
```

## What Each Environment Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `SMTP_SERVER` | Email server host | smtp.gmail.com |
| `SMTP_PORT` | Email server port | 587 |
| `SMTP_USERNAME` | Login email | 2303a52486@sru.edu.in |
| `SMTP_PASSWORD` | App password or password | rqom yvgl ksbv dkup |
| `EMAIL_FROM_NAME` | Sender display name | Aevum AI |
| `DEFAULT_ACCOUNT_EMAIL` | Default recipient | 2303a52486@sru.edu.in |
| `TEAM_EMAIL` | Fallback email | Optional |

## Complete Email Sending Sequence

### From Frontend User's Perspective:
```
1. Events page loads
2. User clicks event to expand
3. Sees draft content variations
4. Selects a variation
5. Clicks "Approve" button
   └─> Backend: POST /api/approvals?content_id=X&approved_by=user
6. Content status updates to 'approved'
7. User clicks "Send Email" button
   └─> Backend: POST /api/content/X/publish/email?recipient=user@email.com
8. EmailService.send_email() runs:
   └─> Connects to SMTP server
   └─> Authenticates with SMTP_USERNAME + SMTP_PASSWORD
   └─> Sends email to recipient
   └─> Records in analytics
9. User sees success message
```

### From Backend Perspective:
```
POST /api/approvals?content_id=X&approved_by=user
├─ Get content from DB
├─ Check current status
├─ Update approval_status to 'approved'
└─ Return success

POST /api/content/X/publish/email?recipient=user@email.com
├─ Get content from DB
├─ Check approval_status == 'approved' ✓ (must be approved)
├─ Check SMTP credentials exist ✓ (need SMTP_USERNAME + SMTP_PASSWORD)
├─ Check recipient email ✓ (use parameter or DEFAULT_ACCOUNT_EMAIL)
├─ Call EmailService.send_email()
│  ├─ Create MIME message
│  ├─ Connect to SMTP server
│  ├─ Authenticate
│  ├─ Send email
│  └─ Close connection
├─ Record in analytics table
└─ Return success response
```

## Testing Email End-to-End

### Test 1: Verify SMTP Config
```bash
# SSH into Render or check logs
# Look for: "✓ Email sent to user@example.com"
```

### Test 2: Approve & Send via Dashboard
1. Open Aevum AI dashboard
2. Go to Events page
3. Create/view a campaign
4. Click Approve button
5. Look for Send/Publish button
6. Click and verify email received

### Test 3: Test with API
```bash
# Test with your credentials
curl -X POST "https://aevum-ai.onrender.com/api/approvals?content_id=cont_abc123&approved_by=testuser"

# Then send
curl -X POST "https://aevum-ai.onrender.com/api/content/cont_abc123/publish/email?recipient=2303a52486@sru.edu.in"
```

## Gmail App Password Setup (Step-by-Step)

### For Gmail (2FA Enabled):
1. Go to https://myaccount.google.com
2. Click "Security" in left menu
3. Find "App passwords" section
4. Select "Mail" and "Windows Computer" (or your device)
5. Copy the generated 16-character password
6. Use in `SMTP_PASSWORD` (paste the whole thing, including spaces)

### For Gmail (No 2FA):
1. **Enable 2FA first** (recommended for security)
2. Then follow steps above

## Common SMTP Server Ports

| Server | Port (TLS) | Port (SSL) | Host |
|--------|-----------|-----------|------|
| Gmail | 587 | 465 | smtp.gmail.com |
| Outlook | 587 | 465 | smtp-mail.outlook.com |
| SendGrid | 587 | 465 | smtp.sendgrid.net |
| AWS SES | 587 | 465 | email-smtp.region.amazonaws.com |

## After Sending Email

### Where Email Status is Tracked:
1. **Database**: `analytics` table records each email
2. **Dashboard**: Should show email in "Sent" status
3. **Email**: Check recipient inbox (and spam folder)

### To Resend an Email:
1. The content stays 'approved'
2. You can call publish/email again
3. Each send is recorded separately in analytics

---

**Remember**: 
- ✅ Content must be APPROVED first
- ✅ SMTP credentials must be in Render env vars
- ✅ Don't use Gmail regular password (use App Password)
- ✅ Check spam folder for test emails
- ✅ Allow 1-2 seconds for email to be sent

Last Updated: May 9, 2026
