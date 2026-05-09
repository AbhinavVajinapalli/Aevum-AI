"""
Aevum AI - FastAPI Backend
Event Publicity Agent with autonomous decision-making and lifecycle automation
"""
import json
import uuid
import sqlite3
import secrets
import hashlib
import base64
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Import app modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import config
from database import init_db
from services.calendar_service import CalendarService
from services.scheduler_service import SchedulerService
from agents.event_publicity_agent import EventPublicityAgent
from integrations.email_service import EmailService
from integrations.linkedin_service import LinkedInService
from integrations.telegram_service import TelegramService
from integrations.whatsapp_service import WhatsAppService
from schemas.event import EventSchema, CampaignSchema, ContentSchema, ApprovalSchema


# Initialize FastAPI app
app = FastAPI(
    title=config.APP_NAME,
    version=config.APP_VERSION,
    description="Intelligent event publicity automation with agentic AI"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db_path = Path(__file__).parent.parent / "aevum_ai.db"
calendar_service = CalendarService()
# Provide EmailService to agent so it can send draft emails when configured
email_service = EmailService()
publicity_agent = EventPublicityAgent(email_service=email_service)
# Initialize scheduler for autonomous campaign generation
scheduler_service = SchedulerService(
    agent=publicity_agent,
    calendar_service=calendar_service,
    db_path=db_path
)
# Initialize LinkedIn service for publishing
linkedin_service = LinkedInService()
telegram_service = TelegramService()
# In-memory PKCE verifier store for local OAuth callback exchange
linkedin_pkce_store: Dict[str, str] = {}
# Initialize WhatsApp service (Twilio)
whatsapp_service = WhatsAppService()


# ============================================================================
# STARTUP / SHUTDOWN
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    init_db()
    print(f"✓ {config.APP_NAME} started")
    print(f"✓ Syncing events from Google Calendar...")
    try:
        calendar_service.fetch_and_sync_events()
    except Exception as e:
        print(f"⚠ Calendar sync skipped: {e}")
    # Start background scheduler for autonomous campaign generation
    scheduler_service.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print(f"✓ {config.APP_NAME} shutting down")
    # Stop background scheduler
    scheduler_service.stop()


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": config.APP_NAME,
        "version": config.APP_VERSION
    }


# ============================================================================
# EVENTS ENDPOINTS
# ============================================================================

@app.get("/api/events", tags=["Events"], response_model=List[Dict[str, Any]])
async def get_events(
    limit: int = Query(10, ge=1, le=100),
    stage: Optional[str] = Query(None, pattern="^(pre_event|during_event|post_event)$")
):
    """
    Get events from database
    Optional filter by lifecycle stage
    """
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if stage:
            cursor.execute(
                "SELECT * FROM events WHERE lifecycle_stage = ? ORDER BY start_time ASC LIMIT ?",
                (stage, limit)
            )
        else:
            cursor.execute("SELECT * FROM events ORDER BY start_time ASC LIMIT ?", (limit,))
        
        events = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/events/{event_id}", tags=["Events"])
async def get_event_detail(event_id: str):
    """Get single event details"""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        event = cursor.fetchone()
        conn.close()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return dict(event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/content/{content_id}/publish/whatsapp", tags=["Publishing"])
async def publish_whatsapp(content_id: str, recipient: Optional[str] = Query(None), message: Optional[str] = Query(None)):
    """Publish approved content via WhatsApp using Twilio.

    If `recipient` is provided it should be an E.164 phone number (e.g. +15558675310).
    If `message` is provided it will override the stored content_text. This handler
    ensures non-string Query defaults don't get sent as message bodies.
    """
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
        content_row = cursor.fetchone()

        if not content_row:
            raise HTTPException(status_code=404, detail="Content not found")

        content = dict(content_row)

        if content.get('approval_status') != 'approved':
            raise HTTPException(status_code=400, detail="Content must be approved before sending")

        # Defensive: only accept message if it's a non-empty string (avoid FastAPI Query sentinel objects)
        if isinstance(message, str) and message.strip():
            text = message.strip()
        else:
            text = content.get('content_text') or 'Update from Aevum AI'

        # Defensive: validate recipient is a plain string (not a Query object)
        if not (isinstance(recipient, str) and recipient.strip()):
            raise HTTPException(status_code=400, detail="No WhatsApp recipient provided. Pass ?recipient=+1555... in the request.")

        # Send message via Twilio service
        result = whatsapp_service.send_message(recipient.strip(), text)

        analytics_id = f"anal_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO analytics (id, platform, content_id, status, sent_at, response_status)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        """, (analytics_id, 'whatsapp', content_id, 'sent', 200))
        conn.commit()
        conn.close()

        return {
            "status": "success",
            "content_id": content_id,
            "recipient": recipient.strip(),
            "twilio": result,
            "message": "WhatsApp message sent successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/content/{content_id}/publish/telegram", tags=["Publishing"])
async def publish_telegram(content_id: str, chat_id: Optional[str] = Query(None), message: Optional[str] = Query(None)):
    """Send approved content via Telegram."""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
        content_row = cursor.fetchone()

        if not content_row:
            raise HTTPException(status_code=404, detail="Content not found")

        content = dict(content_row)
        if content['approval_status'] != 'approved':
            raise HTTPException(status_code=400, detail="Content must be approved before sending")

        text = message or content.get('content_text') or 'Update from Aevum AI'
        result = telegram_service.send_message(chat_id, text)

        analytics_id = f"anal_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO analytics (id, platform, content_id, status, sent_at, response_status)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        """, (analytics_id, 'telegram', content_id, 'sent', 200))
        conn.commit()
        conn.close()

        return {
            "status": "success",
            "content_id": content_id,
            "chat_id": chat_id or telegram_service.default_chat_id,
            "message_id": result.get("message_id"),
            "message": "Telegram message sent successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/events/sync", tags=["Events"])
async def sync_events():
    """Manually trigger event sync from Google Calendar"""
    try:
        events = calendar_service.fetch_and_sync_events()
        return {
            "status": "success",
            "events_synced": len(events),
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CAMPAIGNS & CONTENT GENERATION
# ============================================================================

@app.post("/api/campaigns/generate", tags=["Campaigns"])
async def generate_campaign(event_id: str):
    """
    Generate content for an event using EventPublicityAgent
    Returns multiple variations per platform
    """
    try:
        # Get event
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        event_row = cursor.fetchone()
        
        if not event_row:
            raise HTTPException(status_code=404, detail="Event not found")
        
        event = dict(event_row)
        
        # Call the intelligent agent
        agent_response = publicity_agent.analyze_and_generate_content(
            event=event,
            lifecycle_stage=event['lifecycle_stage'],
            urgency_score=event['urgency_score']
        )
        
        # Create campaign record
        campaign_id = f"camp_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO campaigns (id, event_id, stage, status, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (
            campaign_id,
            event_id,
            event['lifecycle_stage'],
            'draft',
            json.dumps(agent_response)
        ))
        
        # Store generated content variations
        content_ids = []
        for platform_content in agent_response.get('variations', []):
            platform = platform_content.get('platform', 'email')
            
            for var_num in [1, 2, 3]:
                content_text = platform_content.get(f'variation_{var_num}', '')
                hashtags = ','.join(platform_content.get('hashtags', []))
                scheduled_time = platform_content.get('scheduled_time', '09:00')
                
                content_id = f"cont_{uuid.uuid4().hex[:8]}"
                cursor.execute("""
                    INSERT INTO generated_content 
                    (id, campaign_id, platform, content_text, variation_num, tone, hashtags, scheduled_time, status, approval_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    content_id,
                    campaign_id,
                    platform,
                    content_text,
                    var_num,
                    agent_response.get('tone', 'professional'),
                    hashtags,
                    scheduled_time,
                    'draft',
                    'pending'
                ))
                
                content_ids.append(content_id)
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "campaign_id": campaign_id,
            "event": event,
            "agent_analysis": agent_response,
            "content_ids": content_ids,
            "message": f"Generated content with {len(content_ids)} variations across {len(agent_response.get('variations', []))} platforms"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/campaigns", tags=["Campaigns"])
async def list_campaigns(limit: int = Query(50, ge=1, le=500)):
    """Get all campaigns with summary info"""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT c.*, e.title as event_name, e.lifecycle_stage
            FROM campaigns c
            LEFT JOIN events e ON c.event_id = e.id
            ORDER BY c.created_at DESC
            LIMIT ?
        """, (limit,))
        
        campaigns_list = []
        for row in cursor.fetchall():
            campaign = dict(row)
            # Get content count and status breakdown
            cursor.execute("""
                SELECT approval_status, COUNT(*) as count
                FROM generated_content
                WHERE campaign_id = ?
                GROUP BY approval_status
            """, (campaign['id'],))
            
            status_breakdown = {}
            content_count = 0
            for status_row in cursor.fetchall():
                status = dict(status_row)
                status_breakdown[status['approval_status']] = status['count']
                content_count += status['count']
            
            campaign['content_count'] = content_count
            campaign['status_breakdown'] = status_breakdown
            campaigns_list.append(campaign)
        
        conn.close()
        
        return {
            "total_campaigns": len(campaigns_list),
            "campaigns": campaigns_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/campaigns/{campaign_id}", tags=["Campaigns"])
async def get_campaign(campaign_id: str):
    """Get campaign and its generated content"""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get campaign
        cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
        campaign_row = cursor.fetchone()
        
        if not campaign_row:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = dict(campaign_row)
        
        # Get content
        cursor.execute(
            "SELECT * FROM generated_content WHERE campaign_id = ? ORDER BY platform, variation_num",
            (campaign_id,)
        )
        content = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "campaign": campaign,
            "content": content,
            "total_variations": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# APPROVALS
# ============================================================================

@app.post("/api/approvals", tags=["Approvals"])
async def approve_content(
    content_id: str,
    approved_by: str,
    comments: str = ""
):
    """Approve generated content"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verify content exists
        cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Create approval record
        approval_id = f"appr_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO approvals (id, content_id, approved_by, approved_at, comments)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
        """, (approval_id, content_id, approved_by, comments))
        
        # Update content status
        cursor.execute("""
            UPDATE generated_content 
            SET approval_status = 'approved', status = 'approved', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (content_id,))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "approval_id": approval_id,
            "content_id": content_id,
            "message": "Content approved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/approvals/{content_id}/reject", tags=["Approvals"])
async def reject_content(content_id: str, reason: str = ""):
    """Reject generated content"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE generated_content 
            SET approval_status = 'rejected', status = 'draft', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (content_id,))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "content_id": content_id,
            "message": "Content rejected and reverted to draft"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/approvals/pending", tags=["Approvals"])
async def get_pending_approvals(limit: int = Query(20, ge=1, le=100)):
    """Get all pending content awaiting approval"""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT gc.*, c.event_id, e.title as event_title
            FROM generated_content gc
            LEFT JOIN campaigns c ON gc.campaign_id = c.id
            LEFT JOIN events e ON c.event_id = e.id
            WHERE gc.approval_status = 'pending'
            ORDER BY gc.created_at DESC
            LIMIT ?
        """, (limit,))
        
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "total_pending": len(items),
            "items": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/approvals/bulk-approve", tags=["Approvals"])
async def bulk_approve_content(
    content_ids: List[str],
    approved_by: str,
    comments: str = ""
):
    """Approve multiple content pieces at once"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        approved_count = 0
        failed_ids = []
        
        for content_id in content_ids:
            try:
                # Verify content exists
                cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
                if not cursor.fetchone():
                    failed_ids.append(content_id)
                    continue
                
                # Create approval record
                approval_id = f"appr_{uuid.uuid4().hex[:8]}"
                cursor.execute("""
                    INSERT INTO approvals (id, content_id, approved_by, approved_at, comments)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
                """, (approval_id, content_id, approved_by, comments))
                
                # Update content status
                cursor.execute("""
                    UPDATE generated_content 
                    SET approval_status = 'approved', status = 'approved', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (content_id,))
                
                approved_count += 1
            except Exception as e:
                failed_ids.append(content_id)
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "approved_count": approved_count,
            "failed_count": len(failed_ids),
            "failed_ids": failed_ids,
            "message": f"Approved {approved_count} content pieces"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PUBLISHING / SENDING
# ============================================================================

@app.post("/api/content/{content_id}/publish/email", tags=["Publishing"])
async def publish_email(
    content_id: str,
    recipient: Optional[str] = Query(None, description="Email recipient address"),
    use_html: bool = Query(True, description="Send as HTML email")
):
    """Send approved content via email"""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get content
        cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
        content_row = cursor.fetchone()
        
        if not content_row:
            raise HTTPException(status_code=404, detail="Content not found")
        
        content = dict(content_row)
        
        # Only send approved content
        if content['approval_status'] != 'approved':
            raise HTTPException(status_code=400, detail="Content must be approved before sending")
        
        # Try to send via email service
        subject = content['content_text'].split('\n')[0] if content['content_text'] else 'Event Update'
        body = content['content_text']
        
        if not email_service.smtp_user or not email_service.smtp_pass:
            raise HTTPException(
                status_code=400,
                detail="SMTP is not configured. Set SMTP_USERNAME and SMTP_PASSWORD, or EMAIL_SENDER and EMAIL_PASSWORD, to enable email publishing."
            )

        resolved_recipient = (recipient or config.DEFAULT_ACCOUNT_EMAIL or email_service.smtp_user or "").strip()
        if not resolved_recipient:
            raise HTTPException(
                status_code=400,
                detail="No email recipient configured. Set DEFAULT_ACCOUNT_EMAIL or pass recipient in the request."
            )

        sent = email_service.send_email(resolved_recipient, subject, body, html=use_html)
        
        # Record in analytics
        if sent:
            analytics_id = f"anal_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO analytics (id, platform, content_id, status, sent_at, response_status)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            """, (analytics_id, 'email', content_id, 'sent', 200))
            conn.commit()
        
        conn.close()
        
        return {
            "status": "success" if sent else "failed",
            "content_id": content_id,
            "recipient": resolved_recipient,
            "message": "Email sent successfully" if sent else "Email send failed"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/content/{content_id}/publish/linkedin", tags=["Publishing"])
async def publish_linkedin(content_id: str):
    """Post approved content to LinkedIn"""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get content
        cursor.execute("SELECT * FROM generated_content WHERE id = ?", (content_id,))
        content_row = cursor.fetchone()
        
        if not content_row:
            raise HTTPException(status_code=404, detail="Content not found")
        
        content = dict(content_row)
        
        # Only send approved content
        if content['approval_status'] != 'approved':
            raise HTTPException(status_code=400, detail="Content must be approved before sending")
        
        if not linkedin_service.is_configured():
            raise HTTPException(
                status_code=400,
                detail="LinkedIn is not configured. Set LINKEDIN_ACCESS_TOKEN to enable LinkedIn publishing."
            )

        # Post to LinkedIn
        result = linkedin_service.post_content(content['content_text'])
        
        # Record in analytics
        analytics_id = f"anal_{uuid.uuid4().hex[:8]}"
        status = 'sent' if result['success'] else 'failed'
        response_code = 200 if result['success'] else 400
        
        cursor.execute("""
            INSERT INTO analytics (id, platform, content_id, status, sent_at, response_status, response_message)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
        """, (analytics_id, 'linkedin', content_id, status, response_code, result.get('message', '')))
        conn.commit()
        conn.close()
        
        if result['success']:
            return {
                "status": "success",
                "content_id": content_id,
                "post_id": result.get('post_id'),
                "message": result.get('message')
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to post to LinkedIn: {result.get('message')}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ANALYTICS
# ============================================================================

@app.get("/api/integrations/status", tags=["Integrations"])
async def get_integrations_status():
    """Get status of optional third-party integrations."""
    return {
        "linkedin": {
            "configured": linkedin_service.is_configured(),
            "oauth_configured": linkedin_service.is_oauth_configured(),
            "mode": "live" if linkedin_service.is_configured() else "missing",
            "redirect_uri": linkedin_service.redirect_uri
        },
        "smtp": {
            "configured": bool(email_service.smtp_user and email_service.smtp_pass),
            "mode": "live" if (email_service.smtp_user and email_service.smtp_pass) else "missing"
        },
        "gemini": {
            "configured": bool(config.GEMINI_API_KEY),
            "mode": "live" if config.GEMINI_API_KEY else "missing"
        },
        "calendar": {
            "configured": bool(config.GOOGLE_CALENDAR_ID),
            "mode": "live" if config.GOOGLE_CALENDAR_ID else "missing"
        },
        "telegram": {
            "configured": telegram_service.is_configured(),
            "mode": "live" if telegram_service.is_configured() else "missing",
            "bot_link": telegram_service.bot_link()
        }
    }


@app.get("/api/integrations/linkedin/oauth/start", tags=["Integrations"])
async def linkedin_oauth_start(state: Optional[str] = None):
    """Build the LinkedIn OAuth authorization URL for one-time consent."""
    try:
        if not linkedin_service.is_oauth_configured():
            raise HTTPException(
                status_code=400,
                detail="LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI."
            )

        oauth_state = state or secrets.token_urlsafe(16)
        code_verifier = secrets.token_urlsafe(64)
        challenge_digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
        code_challenge = base64.urlsafe_b64encode(challenge_digest).decode("ascii").rstrip("=")
        linkedin_pkce_store[oauth_state] = code_verifier

        return {
            "authorization_url": linkedin_service.build_authorization_url(
                state=oauth_state,
                extra_params={
                    "code_challenge": code_challenge,
                    "code_challenge_method": "S256",
                },
            ),
            "redirect_uri": linkedin_service.redirect_uri,
            "state": oauth_state,
            "scopes": linkedin_service.get_requested_scopes()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/integrations/linkedin/oauth/callback", tags=["Integrations"])
async def linkedin_oauth_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, error_description: Optional[str] = None):
    """Exchange the LinkedIn OAuth authorization code for an access token."""
    try:
        if error:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": error,
                    "error_description": error_description or "LinkedIn authorization failed",
                    "state": state,
                },
            )

        if not code:
            raise HTTPException(status_code=400, detail="Missing authorization code")

        code_verifier = linkedin_pkce_store.pop(state, None) if state else None
        token_data = linkedin_service.exchange_code_for_token(code, code_verifier=code_verifier)
        return {
            "status": "success",
            "message": "LinkedIn access token generated successfully. Copy the access_token into LINKEDIN_ACCESS_TOKEN.",
            "redirect_uri": linkedin_service.redirect_uri,
            "state": state,
            "expires_in": token_data.get("expires_in"),
            "scope": token_data.get("scope"),
            "access_token": token_data.get("access_token")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics", tags=["Analytics"])
async def get_analytics():
    """Get basic analytics"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Count metrics
        cursor.execute("SELECT COUNT(*) as count FROM events")
        total_events = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) as count FROM campaigns")
        total_campaigns = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) as count FROM generated_content WHERE approval_status = 'approved'")
        approved_content = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) as count FROM generated_content WHERE approval_status = 'pending'")
        pending_content = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) as count FROM analytics WHERE status = 'sent'")
        content_sent = cursor.fetchone()[0]
        
        # Platform breakdown
        cursor.execute("SELECT platform, COUNT(*) as count FROM generated_content GROUP BY platform")
        platform_breakdown = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            "total_events": total_events,
            "total_campaigns": total_campaigns,
            "approved_content": approved_content,
            "pending_content": pending_content,
            "content_sent": content_sent,
            "approval_rate": f"{(approved_content / (approved_content + pending_content) * 100) if (approved_content + pending_content) > 0 else 0:.1f}%",
            "platform_breakdown": platform_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print(f"\n🚀 Starting {config.APP_NAME}...")
    print(f"   Version: {config.APP_VERSION}")
    print(f"   Debug: {config.DEBUG}")
    print(f"   Database: {db_path}\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=config.DEBUG,
        log_level=config.LOG_LEVEL.lower()
    )
