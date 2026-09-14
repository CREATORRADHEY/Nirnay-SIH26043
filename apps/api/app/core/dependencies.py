from typing import Optional, Callable
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.actor import Actor
from app.services.auth_service import AuthService
from app.services.policy_service import PolicyService


def get_session_token_from_request(request: Request) -> Optional[str]:
    cookie_token = request.cookies.get("nirnay_session")
    if cookie_token:
        return cookie_token

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    return None


def get_optional_actor(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[Actor]:
    token = get_session_token_from_request(request)
    if not token:
        return None
    return AuthService.get_session_actor(db, token)


def get_current_actor(
    request: Request,
    db: Session = Depends(get_db),
) -> Actor:
    actor = get_optional_actor(request, db)
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to proceed.",
        )
    return actor


def require_permission(permission: str) -> Callable:
    def dependency(actor: Actor = Depends(get_current_actor)) -> Actor:
        if not PolicyService.can_perform_action(actor, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission} required.",
            )
        return actor
    return dependency


def require_government_reviewer(
    current_actor: Actor = Depends(get_current_actor),
) -> Actor:
    if not PolicyService.can_perform_action(current_actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have Government Reviewer permissions to perform this action.",
        )
    return current_actor


def require_platform_admin(
    current_actor: Actor = Depends(get_current_actor),
) -> Actor:
    if not PolicyService.can_perform_action(current_actor, "platform:admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform Administrator permission required.",
        )
    return current_actor
