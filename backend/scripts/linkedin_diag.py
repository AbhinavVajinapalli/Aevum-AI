from config import config
s = getattr(config, 'LINKEDIN_CLIENT_SECRET', None)
print({'client_id': config.LINKEDIN_CLIENT_ID, 'redirect_uri': config.LINKEDIN_REDIRECT_URI})
print({'secret_present': bool(s), 'len': len(s) if s else 0, 'has_whitespace': bool(s and (s.strip()!=s)), 'repr_start_end': (s[:4]+'...'+s[-4:]) if s else None})
