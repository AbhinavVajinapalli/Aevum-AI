"""
LinkedIn integration service for Aevum AI
Handles OAuth2 authentication and content posting to LinkedIn
"""
from typing import Optional, Dict, Any
from urllib.parse import urlencode
import os
import requests
from config import config


class LinkedInService:
    """LinkedIn service for posting event publicity content"""

    AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
    TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    
    def __init__(self, access_token: Optional[str] = None):
        """Initialize LinkedIn service with access token
        
        Args:
            access_token: LinkedIn OAuth2 access token (from config or parameter)
        """
        self.client_id = getattr(config, 'LINKEDIN_CLIENT_ID', '')
        self.client_secret = getattr(config, 'LINKEDIN_CLIENT_SECRET', '')
        self.redirect_uri = getattr(config, 'LINKEDIN_REDIRECT_URI', 'http://localhost:8000/api/integrations/linkedin/oauth/callback')
        self.author_urn = getattr(config, 'LINKEDIN_AUTHOR_URN', '')
        self.access_token = access_token or getattr(config, 'LINKEDIN_ACCESS_TOKEN', '')
        self.api_base = 'https://api.linkedin.com/v2'
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
    
    def is_oauth_configured(self) -> bool:
        """Check if LinkedIn OAuth settings are configured."""
        return bool(self.client_id and self.client_secret and self.redirect_uri)

    def is_configured(self) -> bool:
        """Check if LinkedIn is configured with access token"""
        return bool(self.access_token)

    def build_authorization_url(self, state: Optional[str] = None, extra_params: Optional[Dict[str, str]] = None) -> str:
        """Build the LinkedIn OAuth authorization URL."""
        if not self.is_oauth_configured():
            raise ValueError("LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI.")

        scopes = self.get_requested_scopes()

        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': scopes
        }
        if state:
            params['state'] = state
        if extra_params:
            params.update(extra_params)

        return f"{self.AUTH_URL}?{urlencode(params)}"

    def get_requested_scopes(self) -> str:
        """Return normalized OAuth scopes from config/env."""
        # OIDC-compatible default. Share scope requires separate product access.
        default_scopes = 'openid profile email'
        raw_scopes = getattr(config, 'LINKEDIN_SCOPES', None) or os.getenv('LINKEDIN_SCOPES', '')
        if raw_scopes:
            # accept comma or space separated
            return ' '.join([s.strip() for s in raw_scopes.replace(',', ' ').split() if s.strip()])
        return default_scopes

    def exchange_code_for_token(self, code: str, redirect_uri: Optional[str] = None, code_verifier: Optional[str] = None) -> Dict[str, Any]:
        """Exchange an authorization code for an access token."""
        redirect_uri = redirect_uri or self.redirect_uri
        if not self.is_oauth_configured():
            raise ValueError("LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI.")

        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
        }
        if code_verifier:
            payload['code_verifier'] = code_verifier

        response = requests.post(
            self.TOKEN_URL,
            data=payload,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=15,
            allow_redirects=False,
        )

        # Some environments may redirect this endpoint and change POST to GET.
        # Follow one redirect manually while preserving POST body.
        if 300 <= response.status_code < 400 and response.headers.get('Location'):
            response = requests.post(
                response.headers['Location'],
                data=payload,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=15,
                allow_redirects=False,
            )

        if response.status_code >= 400:
            try:
                error_payload = response.json()
            except ValueError:
                error_payload = {'raw': response.text}
            raise RuntimeError(
                f"LinkedIn token exchange failed ({response.status_code}): {error_payload}"
            )

        token_data = response.json()
        self.access_token = token_data.get('access_token', '')
        self.headers['Authorization'] = f'Bearer {self.access_token}'
        return token_data
    
    def post_content(self, content_text: str, user_urn: Optional[str] = None) -> Dict[str, Any]:
        """Post content to LinkedIn
        
        Args:
            content_text: The content to post (text)
            user_urn: LinkedIn user URN (e.g., 'urn:li:person:12345')
        
        Returns:
            {
                'success': bool,
                'post_id': str (if successful),
                'error': str (if failed),
                'message': str
            }
        """
        if not self.is_configured():
            return {
                'success': False,
                'error': 'UNCONFIGURED',
                'message': 'LinkedIn access token not configured. Set LINKEDIN_ACCESS_TOKEN in .env'
            }
        
        try:
            # Precedence: explicit argument -> configured author URN -> authenticated member URN
            author_urn = user_urn or self.author_urn or self.get_author_urn()
            if not author_urn:
                return {
                    'success': False,
                    'error': 'AUTHOR_UNAVAILABLE',
                    'message': 'Could not resolve a LinkedIn author URN. The token may be missing the profile permission needed to publish.'
                }

            # LinkedIn's supported organic posting endpoint
            endpoint = f"{self.api_base}/ugcPosts"

            payload = {
                'author': author_urn,
                'lifecycleState': 'PUBLISHED',
                'specificContent': {
                    'com.linkedin.ugc.ShareContent': {
                        'shareCommentary': {
                            'text': content_text,
                            'attributes': []
                        },
                        'shareMediaCategory': 'NONE',
                        'media': []
                    }
                },
                'visibility': {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            }
            
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                post_id = response.headers.get('x-restli-id')
                if not post_id:
                    try:
                        post_data = response.json()
                        post_id = post_data.get('id') or post_data.get('value', {}).get('id') or 'unknown'
                    except ValueError:
                        post_id = 'unknown'
                return {
                    'success': True,
                    'post_id': post_id,
                    'message': f'Successfully posted to LinkedIn (ID: {post_id})'
                }
            else:
                error_msg = response.text or f'HTTP {response.status_code}'
                return {
                    'success': False,
                    'error': f'HTTP_{response.status_code}',
                    'message': f'Failed to post to LinkedIn: {error_msg}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': 'REQUEST_ERROR',
                'message': f'Error posting to LinkedIn: {str(e)}'
            }

    def get_author_urn(self) -> Optional[str]:
        """Resolve the authenticated member URN for UGC post creation."""
        if not self.is_configured():
            return None

        endpoints = [
            f"{self.api_base}/me",
            f"{self.api_base}/userinfo",
        ]

        for endpoint in endpoints:
            try:
                response = requests.get(endpoint, headers=self.headers, timeout=10)
                if response.status_code != 200:
                    continue

                data = response.json()
                member_id = data.get('id') or data.get('sub')
                if not member_id:
                    continue

                # LinkedIn accepts either a person URN or organization URN as the author.
                if str(member_id).startswith('urn:li:'):
                    return str(member_id)
                return f"urn:li:person:{member_id}"
            except Exception:
                continue

        return None
    
    def get_profile(self) -> Dict[str, Any]:
        """Fetch authenticated user's profile info
        
        Returns:
            {
                'success': bool,
                'profile': {...} (if successful),
                'error': str (if failed)
            }
        """
        if not self.is_configured():
            return {'success': False, 'error': 'UNCONFIGURED'}
        
        try:
            endpoint = f"{self.api_base}/me"
            response = requests.get(endpoint, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'profile': response.json()
                }
            else:
                return {
                    'success': False,
                    'error': f'HTTP_{response.status_code}'
                }
        except Exception as e:
            return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    svc = LinkedInService()
    print(f"LinkedIn Service initialized (configured={svc.is_configured()})")
    print(f"Token present: {'Yes' if svc.access_token else 'No (set LINKEDIN_ACCESS_TOKEN in .env)'}")
