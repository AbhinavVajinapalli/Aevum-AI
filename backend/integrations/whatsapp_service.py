from typing import Optional, List
from twilio.rest import Client

from config import config


class WhatsAppService:
    """
    Twilio SDK-based WhatsApp service.

    Configure via env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
    `TWILIO_WHATSAPP_FROM` (e.g. "whatsapp:+14155238886").
    """

    def __init__(self):
        self.account_sid = getattr(config, "TWILIO_ACCOUNT_SID", "") or ""
        self.auth_token = getattr(config, "TWILIO_AUTH_TOKEN", "") or ""
        self.from_whatsapp = getattr(config, "TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
        self.client = Client(self.account_sid, self.auth_token)

    def _format_whatsapp(self, number: str) -> str:
        number = number.strip()
        return number if number.startswith("whatsapp:") else f"whatsapp:{number}"

    def send_message(self, to_number: str, body: str, media_urls: Optional[List[str]] = None) -> dict:
        """Send a WhatsApp message using Twilio SDK. Returns a small dict with message info."""
        to_addr = self._format_whatsapp(to_number)
        params = {"body": body, "from_": self.from_whatsapp, "to": to_addr}
        if media_urls:
            params["media_url"] = media_urls

        msg = self.client.messages.create(**params)
        return {"sid": msg.sid, "status": msg.status, "to": msg.to, "from": msg.from_}


if __name__ == "__main__":
    svc = WhatsAppService()
    print("WhatsAppService initialized", {"from": svc.from_whatsapp})
