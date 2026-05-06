from config import config
from app.integrations.linkedin_service import LinkedInService

svc = LinkedInService()
print({
    'token_present': bool(config.LINKEDIN_ACCESS_TOKEN),
    'token_len': len(config.LINKEDIN_ACCESS_TOKEN) if config.LINKEDIN_ACCESS_TOKEN else 0,
    'oauth_configured': svc.is_oauth_configured(),
    'configured': svc.is_configured(),
    'scopes': svc.get_requested_scopes(),
})
