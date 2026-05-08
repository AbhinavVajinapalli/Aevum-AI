"""Configuration management for Aevum AI."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)


class Config:
    """Base configuration"""
    # App
    APP_NAME = os.getenv("APP_NAME", "Aevum AI - Event Publicity Agent")
    APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aevum_ai.db")
    
    # Google APIs
    GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH", "./credentials.json")
    GOOGLE_CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Non-interactive Google OAuth for deployed environments (Render, Railway, etc.)
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN", "")
    GOOGLE_TOKEN_URI = os.getenv("GOOGLE_TOKEN_URI", "https://oauth2.googleapis.com/token")

    # Allow interactive local OAuth login only when explicitly enabled
    ALLOW_INTERACTIVE_OAUTH = os.getenv("ALLOW_INTERACTIVE_OAUTH", "True").lower() == "true"
    
    # Email
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    # Default account email set to user's requested address
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", os.getenv("EMAIL_SENDER", "2303a52486@sru.edu.in"))
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", os.getenv("EMAIL_PASSWORD", ""))
    EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Aevum AI")
    TEAM_EMAIL = os.getenv("TEAM_EMAIL", "")

    # Default account used for dashboard actions (can be overridden via env)
    DEFAULT_ACCOUNT_EMAIL = os.getenv("DEFAULT_ACCOUNT_EMAIL", SMTP_USERNAME)
    
    # LinkedIn
    # Do not fall back to hardcoded app credentials; always use the active .env values.
    LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
    LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/api/integrations/linkedin/oauth/callback")
    LINKEDIN_AUTHOR_URN = os.getenv("LINKEDIN_AUTHOR_URN", "")
    LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
    # Twilio / WhatsApp
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

    # Telegram
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "aevum_ai_bot")
    TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
    
    # CORS
    @staticmethod
    def _parse_cors_origins(value: str | None) -> list[str]:
        if not value:
            return ["http://localhost:3000"]

        raw = value.strip()
        # Support JSON arrays: ["http://localhost:3000", "http://localhost:5173"]
        if raw.startswith("["):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(origin).strip() for origin in parsed if str(origin).strip()]
            except Exception:
                pass

        # Fallback: comma-separated list
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    CORS_ORIGINS = _parse_cors_origins(os.getenv("CORS_ORIGINS"))
    
    # Scheduler
    SCHEDULER_ENABLED = os.getenv("SCHEDULER_ENABLED", "True").lower() == "true"
    SCHEDULER_INTERVAL_HOURS = int(os.getenv("SCHEDULER_INTERVAL_HOURS", "6"))

    # Demo / production behavior
    # In hosted environments without calendar credentials, default to demo mode
    # so the dashboard remains usable out-of-the-box.
    ALLOW_DEMO_MODE = os.getenv("ALLOW_DEMO_MODE", "True").lower() == "true"


config = Config()
