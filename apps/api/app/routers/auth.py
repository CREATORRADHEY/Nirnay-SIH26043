import uuid
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor, get_session_token_from_request
from app.models.actor import Actor
from app.services.auth_service import AuthService
from app.core.security import generate_secure_token, hash_token

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    display_name: str
    email: str
    password: str
    platform_role: Optional[str] = "COMMUNITY_REPORTER"


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: str


class SessionResponse(BaseModel):
    id: str
    created_at: str
    expires_at: str
    last_seen_at: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_current: bool = False


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")

    actor, raw_token = AuthService.register_account(
        db=db,
        display_name=payload.display_name,
        email=payload.email,
        password=payload.password,
        platform_role=payload.platform_role or "COMMUNITY_REPORTER",
        ip_address=ip_address,
        user_agent=user_agent,
    )

    csrf_token = generate_secure_token()
    response.set_cookie(
        key="nirnay_session",
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        max_age=30 * 24 * 3600,
    )
    response.set_cookie(
        key="nirnay_csrf",
        value=csrf_token,
        httponly=False,
        samesite="lax",
        secure=False,
        path="/",
        max_age=30 * 24 * 3600,
    )

    account = actor.account
    return {
        "id": str(actor.id),
        "display_name": actor.display_name,
        "email": account.email if account else None,
        "platform_role": actor.platform_role,
        "csrf_token": csrf_token,
    }


@router.post("/login")
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")

    actor, raw_token = AuthService.authenticate(
        db=db,
        email=payload.email,
        password=payload.password,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    csrf_token = generate_secure_token()
    response.set_cookie(
        key="nirnay_session",
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        max_age=30 * 24 * 3600,
    )
    response.set_cookie(
        key="nirnay_csrf",
        value=csrf_token,
        httponly=False,
        samesite="lax",
        secure=False,
        path="/",
        max_age=30 * 24 * 3600,
    )

    account = actor.account
    return {
        "id": str(actor.id),
        "display_name": actor.display_name,
        "email": account.email if account else None,
        "platform_role": actor.platform_role,
        "csrf_token": csrf_token,
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    raw_token = get_session_token_from_request(request)
    if raw_token:
        AuthService.logout_session(db, raw_token)

    response.delete_cookie(key="nirnay_session", path="/")
    response.delete_cookie(key="nirnay_csrf", path="/")
    return {"message": "Successfully logged out."}


@router.get("/me")
def get_current_user_profile(
    actor: Actor = Depends(get_current_actor),
):
    account = actor.account
    memberships = []
    for m in actor.memberships:
        memberships.append(
            {
                "id": str(m.id),
                "organization_id": str(m.organization_id),
                "organization_name": m.organization.name,
                "organization_type": m.organization.organization_type,
                "role": m.role,
                "is_primary": m.is_primary,
            }
        )

    return {
        "id": str(actor.id),
        "display_name": actor.display_name,
        "email": account.email if account else None,
        "platform_role": actor.platform_role,
        "is_active": actor.is_active,
        "created_at": actor.created_at.isoformat(),
        "memberships": memberships,
    }


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    current_token = get_session_token_from_request(request)
    AuthService.change_password(
        db=db,
        actor=actor,
        old_password=payload.old_password,
        new_password=payload.new_password,
        current_token=current_token,
    )
    return {"message": "Password updated successfully."}


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    token = AuthService.forgot_password(db, payload.email)
    return {
        "message": "If an account exists with this email address, password reset instructions have been sent.",
        "dev_debug_token": token,
    }


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    AuthService.reset_password(db, payload.token, payload.new_password)
    return {"message": "Password reset successfully. Please sign in with your new password."}


@router.post("/verify-email")
def verify_email(
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    AuthService.verify_email(db, payload.token)
    return {"message": "Email address successfully verified."}


@router.post("/resend-verification")
def resend_verification(
    payload: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    token = AuthService.resend_verification(db, payload.email)
    return {
        "message": "If an account exists with this email address, a verification link has been sent.",
        "dev_debug_token": token,
    }


@router.get("/sessions", response_model=List[SessionResponse])
def list_sessions(
    request: Request,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    current_token = get_session_token_from_request(request)
    current_hash = hash_token(current_token) if current_token else None

    sessions = AuthService.get_active_sessions(db, actor.id)
    result = []
    for s in sessions:
        result.append(
            SessionResponse(
                id=str(s.id),
                created_at=s.created_at.isoformat(),
                expires_at=s.expires_at.isoformat(),
                last_seen_at=s.last_seen_at.isoformat(),
                ip_address=s.ip_address,
                user_agent=s.user_agent,
                is_current=(current_hash is not None and s.token_hash == current_hash),
            )
        )
    return result


@router.delete("/sessions/{session_id}")
def revoke_session(
    session_id: str,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    try:
        s_uuid = uuid.UUID(session_id)
        AuthService.revoke_session(db, actor.id, s_uuid)
        return {"message": "Session revoked successfully."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID.")


@router.post("/sessions/revoke-others")
def revoke_other_sessions(
    request: Request,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    current_token = get_session_token_from_request(request)
    AuthService.revoke_other_sessions(db, actor.id, current_token)
    return {"message": "All other sessions revoked successfully."}
