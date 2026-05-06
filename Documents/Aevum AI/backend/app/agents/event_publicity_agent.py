"""
EventPublicityAgent - Intelligent AI agent for event publicity
Makes autonomous decisions about content strategy, platforms, tone, and messaging
"""
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
try:
    import google.generativeai as genai
except Exception:
    genai = None
from config import config

# Local import for sending email drafts when available
try:
    from app.integrations.email_service import EmailService
except Exception:
    EmailService = None


class EventPublicityAgent:
    """
    Agentic AI that decides:
    - Type and format of content
    - Target platforms
    - Tone and messaging strategy
    - Urgency and timing
    - Hashtags and engagement hooks
    """
    
    def __init__(self, email_service: Optional[EmailService] = None):
        """Initialize the agent with Gemini API and optional EmailService.

        Pass an `EmailService` instance to enable draft sending via SMTP.
        """
        self.agent_id = f"agent_{uuid.uuid4().hex[:8]}"
        self.email_service = email_service

        # Configure Gemini if available and API key present
        if genai and getattr(config, 'GEMINI_API_KEY', ''):
            try:
                genai.configure(api_key=config.GEMINI_API_KEY)
                # Prefer current Gemini models; fallback for older accounts.
                preferred_models = [
                    'gemini-2.5-flash',
                    'gemini-flash-latest',
                    'gemini-1.5-flash',
                    'gemini-1.5-pro',
                    'gemini-pro',
                ]
                self.model = None
                for model_name in preferred_models:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        break
                    except Exception:
                        continue
            except Exception:
                self.model = None
        else:
            self.model = None
    
    def analyze_and_generate_content(
        self, 
        event: Dict[str, Any],
        lifecycle_stage: str,
        urgency_score: int
    ) -> Dict[str, Any]:
        """
        Main decision-making method. Agent analyzes event and generates platform-specific content.
        
        Args:
            event: Event data {title, description, start_time, end_time, event_type}
            lifecycle_stage: "pre_event", "during_event", or "post_event"
            urgency_score: 1-10 scale
        
        Returns:
            {
                "event_analysis": str,
                "audience": str,
                "platforms": ["twitter", "email", "linkedin"],
                "tone": str,
                "content_strategy": str,
                "variations": [
                    {
                        "platform": "email",
                        "variation_1": str,
                        "variation_2": str,
                        "variation_3": str,
                        "hashtags": [str],
                        "scheduled_time": str
                    }
                ]
            }
        """
        
        # Build intelligent prompt for Gemini
        prompt = self._build_analysis_prompt(event, lifecycle_stage, urgency_score)
        
        # If LLM available, attempt to call; otherwise use fallback
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                response_text = response.text

                # Parse JSON response from Gemini
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1

                if json_start != -1 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    result = json.loads(json_str)
                else:
                    result = self._build_fallback_response(event, lifecycle_stage)

            except Exception as e:
                print(f"❌ Agent error: {e}")
                if config.ALLOW_DEMO_MODE:
                    result = self._build_fallback_response(event, lifecycle_stage)
                else:
                    raise RuntimeError(
                        "Gemini generation failed. Verify GEMINI_API_KEY and model access for full system mode."
                    )
        else:
            if config.ALLOW_DEMO_MODE:
                result = self._build_fallback_response(event, lifecycle_stage)
            else:
                raise RuntimeError(
                    "Gemini API is not configured. Set GEMINI_API_KEY to run in full system mode."
                )

        # Post-process result to add email templates for any email platform variations
        for v in result.get('variations', []):
            if v.get('platform') == 'email':
                # Build full email body templates for each variation entry
                for i in range(1, 4):
                    key = f'variation_{i}'
                    subj = v.get(key, '')
                    # Ensure subject prefix
                    if not subj.lower().startswith('subject:'):
                        subj = f"Subject: {subj}"
                        v[key] = subj

                    # create bodies
                    body_plain = self._build_email_body_plain(event, subj, lifecycle_stage)
                    body_html = self._build_email_body_html(event, subj, lifecycle_stage)
                    v.setdefault('email_templates', {})[key] = {
                        'subject': subj.replace('Subject: ', ''),
                        'plain': body_plain,
                        'html': body_html
                    }

        return result
    
    def _build_analysis_prompt(
        self, 
        event: Dict[str, Any],
        lifecycle_stage: str,
        urgency_score: int
    ) -> str:
        """Build the prompt for Gemini with all context"""
        
        stage_context = {
            "pre_event": "Event is upcoming. Focus on excitement, registration, and early promotion.",
            "during_event": "Event is happening now. Generate live updates, real-time engagement, urgent calls to action.",
            "post_event": "Event is finished. Focus on thank you, highlights, feedback requests, next steps."
        }
        
        prompt = f"""
You are an intelligent event publicity agent making strategic marketing decisions.

EVENT DATA:
- Title: {event.get('title', 'Unknown')}
- Description: {event.get('description', '')}
- Type: {event.get('event_type', 'workshop')}
- Start: {event.get('start_time', '')}
- End: {event.get('end_time', '')}

CONTEXT:
- Lifecycle Stage: {lifecycle_stage}
- {stage_context.get(lifecycle_stage, '')}
- Urgency Score: {urgency_score}/10 (higher = more urgent/imminent)

Your task: Analyze this event and make strategic decisions about publicity.

RESPOND IN JSON FORMAT ONLY (no other text):
{{
    "event_analysis": "Your analysis of the event type, target audience, and key selling points (2-3 sentences)",
    "audience": "Who should this event appeal to?",
    "platforms": ["email", "linkedin"],
    "tone": "formal",
    "content_strategy": "Your strategy for this event in this lifecycle stage (1-2 sentences)",
    "variations": [
        {{
            "platform": "email",
            "variation_1": "Email subject: ...",
            "variation_2": "Email subject: ...",
            "variation_3": "Email subject: ...",
            "hashtags": ["#event", "#university"],
            "scheduled_time": "09:00"
        }},
        {{
            "platform": "linkedin",
            "variation_1": "LinkedIn post variation 1 (150-200 chars)",
            "variation_2": "LinkedIn post variation 2 (150-200 chars)",
            "variation_3": "LinkedIn post variation 3 (150-200 chars)",
            "hashtags": ["#event", "#professionals"],
            "scheduled_time": "08:00"
        }}
    ]
}}

IMPORTANT:
1. Generate 3 variations per platform - different angles/hooks
2. For email: Start with "Subject:" in each variation
3. For LinkedIn: Keep content professional, 150-200 characters each
4. Include relevant hashtags (3-5 per platform)
5. Suggest optimal posting times based on platform and audience
6. Match tone to audience and lifecycle stage
"""
        return prompt
    
    def _build_fallback_response(self, event: Dict[str, Any], lifecycle_stage: str) -> Dict[str, Any]:
        """Fallback response if Gemini API fails"""
        base = {
            "event_analysis": f"University {event.get('event_type', 'event')}: {event.get('title', 'Upcoming Event')}",
            "audience": "Students, faculty, and staff",
            "platforms": ["email", "linkedin"],
            "tone": "professional",
            "content_strategy": f"Strategic promotion for {lifecycle_stage} stage",
            "variations": [
                {
                    "platform": "email",
                    "variation_1": f"Subject: Join us for {event.get('title', 'our event')} - Limited spots!",
                    "variation_2": f"Subject: Don't miss {event.get('title', 'our event')} - Register now",
                    "variation_3": f"Subject: {event.get('title', 'Our event')} is coming - Save your spot",
                    "hashtags": ["#event", "#university"],
                    "scheduled_time": "09:00"
                },
                {
                    "platform": "linkedin",
                    "variation_1": f"Excited to announce {event.get('title', 'our upcoming event')}! Join us for an enriching experience.",
                    "variation_2": f"Don't miss this opportunity! {event.get('title', 'Event')} is happening soon.",
                    "variation_3": f"Mark your calendars! {event.get('title', 'Our event')} is coming to you.",
                    "hashtags": ["#event", "#learning"],
                    "scheduled_time": "08:00"
                }
            ]
        }

        # Add email templates to fallback before returning
        for v in base.get('variations', []):
            if v.get('platform') == 'email':
                for i in range(1, 4):
                    key = f'variation_{i}'
                    subj = v.get(key, '')
                    body_plain = self._build_email_body_plain(event, subj, lifecycle_stage)
                    body_html = self._build_email_body_html(event, subj, lifecycle_stage)
                    v.setdefault('email_templates', {})[key] = {
                        'subject': subj.replace('Subject: ', ''),
                        'plain': body_plain,
                        'html': body_html
                    }

        return base

    def _build_email_body_plain(self, event: Dict[str, Any], subject_line: str, lifecycle_stage: str) -> str:
        """Construct a plain-text email body based on event data and lifecycle stage."""
        title = event.get('title', '')
        desc = event.get('description', '')
        start = event.get('start_time', '')
        if lifecycle_stage == 'pre_event':
            intro = f"You're invited to {title}!" \
                    + "\n\n" + desc
        elif lifecycle_stage == 'during_event':
            intro = f"{title} is happening now! Join live updates." + "\n\n" + desc
        else:
            intro = f"Thank you for attending {title}. Here's what happened:" + "\n\n" + desc

        footer = "\n\nBest regards,\nAevum AI Team"

        body = f"{intro}\n\nWhen: {start}\n\n{footer}"
        return body

    def _build_email_body_html(self, event: Dict[str, Any], subject_line: str, lifecycle_stage: str) -> str:
        """Construct a simple HTML email body."""
        title = event.get('title', '')
        desc = event.get('description', '')
        start = event.get('start_time', '')
        if lifecycle_stage == 'pre_event':
            intro = f"<h2>You're invited to {title}!</h2><p>{desc}</p>"
        elif lifecycle_stage == 'during_event':
            intro = f"<h2>{title} — Happening now</h2><p>{desc}</p>"
        else:
            intro = f"<h2>Thanks for joining {title}</h2><p>{desc}</p>"

        footer = "<p>Best regards,<br/>Aevum AI Team</p>"

        body = f"{intro}<p><strong>When:</strong> {start}</p>{footer}"
        return body

    def send_email_draft(self, to_address: str, event: Dict[str, Any], variation_index: int = 1) -> bool:
        """Send a draft email using the selected email variation (1-3). Returns True if sent or simulated.

        If SMTP is not configured, this will return False but still provide the template data.
        """
        # Generate content
        result = self.analyze_and_generate_content(event, event.get('lifecycle_stage', 'pre_event'), event.get('urgency_score', 5))
        # Find first email variation
        email_var = None
        for v in result.get('variations', []):
            if v.get('platform') == 'email':
                email_var = v
                break

        if not email_var:
            print("⚠ No email variation available")
            return False

        key = f'variation_{variation_index}'
        template = email_var.get('email_templates', {}).get(key)
        if not template:
            print(f"⚠ No template for {key}")
            return False

        # If EmailService not provided or not configured, just print draft and return False
        if not self.email_service:
            print("⚠ EmailService not configured — draft ready but not sent")
            print('Subject:', template['subject'])
            print('Plain body:\n', template['plain'])
            return False

        # Send via EmailService
        sent = self.email_service.send_email(to_address, template['subject'], template['html'], html=True)
        return sent
