from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Get current user from JWT token
    For now, returns a mock user. In production, validate JWT token properly.
    """
    try:
        if not credentials:
            # Allow anonymous access for now
            return None
        
        # In a real implementation, you would:
        # 1. Decode and validate the JWT token
        # 2. Extract user information from the token
        # 3. Verify the user exists in the database
        # 4. Return user information
        
        # For now, return a mock user
        return {
            "id": 1,
            "email": "user@example.com",
            "role": "patient"
        }
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return None

def require_auth(user: Optional[Dict[str, Any]] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Require authentication for protected endpoints
    """
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Autenticazione richiesta"
        )
    return user 