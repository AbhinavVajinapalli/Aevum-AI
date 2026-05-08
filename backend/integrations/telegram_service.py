from typing import Optional

import requests

from config import config


class TelegramService:
    """Minimal Telegram Bot API helper for sending messages."""

    def __init__(self):
        self.bot_token = getattr(config, "TELEGRAM_BOT_TOKEN", "") or ""
        self.bot_username = getattr(config, "TELEGRAM_BOT_USERNAME", "aevum_ai_bot") or "aevum_ai_bot"
        self.default_chat_id = getattr(config, "TELEGRAM_CHAT_ID", "") or ""

    def is_configured(self) -> bool:
        return bool(self.bot_token)

    def bot_link(self) -> str:
        return f"https://t.me/{self.bot_username.lstrip('@')}"

    def send_message(self, chat_id: Optional[str], text: str) -> dict:
        if not self.bot_token:
            raise ValueError("Telegram bot token is not configured")

        target_chat_id = (chat_id or self.default_chat_id or "").strip()
        if not target_chat_id:
            raise ValueError("Telegram chat_id is required")

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        response = requests.post(
            url,
            json={"chat_id": target_chat_id, "text": text, "disable_web_page_preview": False},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        if not payload.get("ok"):
            raise ValueError(payload.get("description") or "Telegram API request failed")
        return payload["result"]
