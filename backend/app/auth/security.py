import json
import base64
import hmac
import hashlib
import time
from typing import Dict, Any, Optional

SECRET_KEY = "alphaquant-institutional-jwt-secret-key-2026"

def create_access_token(user_data: Dict[str, Any], expires_in_seconds: int = 86400 * 30) -> str:
    """Create a signed, base64-encoded session token (30-day default validity)."""
    payload = {
        "user_id": user_data["id"],
        "email": user_data["email"],
        "full_name": user_data["full_name"],
        "tier": user_data.get("tier", "PRO_QUANT"),
        "exp": int(time.time()) + expires_in_seconds
    }
    payload_json = json.dumps(payload)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode('utf-8')).decode('utf-8')
    
    # Signature
    sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify signature and expiration of a session token."""
    if not token or "." not in token:
        return None
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(sig, expected_sig):
            return None
            
        payload_json = base64.urlsafe_b64decode(payload_b64.encode('utf-8')).decode('utf-8')
        payload = json.loads(payload_json)
        
        if payload.get("exp", 0) < time.time():
            return None  # Token expired
            
        return payload
    except Exception:
        return None
