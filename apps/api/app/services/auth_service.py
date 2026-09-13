from datetime import datetime, timedelta, timezone
import uuid
from typing import Optional, Tuple, List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, generate_secure_token, hash_token
from app.models.actor import Actor
from app.models.account import Account
from app.models.auth_session import AuthSession
from app.models.auth_tokens import EmailVerificationToken, PasswordResetToken
from app.services.audit_service import log_security_event
from app.core.enums import SecurityAuditEventType


class AuthService:
    SESSION_DURATION_DAYS = 30
    TOKEN_EXPIRY_HOURS = 24

    @classmethod
    def register_account(
        cls,
        db: Session,
        display_name: str,
        email: str,
        password: str,
        platform_role: str = "COMMUNITY_REPORTER",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[Actor, str]:
        normalized_email = email.strip().lower()

        existing_acc = db.scalar(select(Account).where(Account.email == normalized_email))
        if existing_acc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        actor = Actor(
            display_name=display_name.strip(),
            platform_role=platform_role,
            is_active=True,
        )
        db.add(actor)
        db.flush()

        hashed_pwd = hash_password(password)
        account = Account(
            actor_id=actor.id,
            email=normalized_email,
            password_hash=hashed_pwd,
            is_verified=False,
        )
        db.add(account)

        raw_session_token = generate_secure_token()
        session_obj = AuthSession(
            actor_id=actor.id,
            token_hash=hash_token(raw_session_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=cls.SESSION_DURATION_DAYS),
            last_seen_at=datetime.now(timezone.utc),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(session_obj)

        log_security_event(
            db,
            event_type=SecurityAuditEventType.LOGIN_SUCCESS,
            actor_id=str(actor.id),
            account_id=str(account.id),
            ip_address=ip_address,
            user_agent=user_agent,
            details="Account registered successfully.",
        )

        db.commit()

        return actor, raw_session_token

    @classmethod
    def authenticate(
        cls,
        db: Session,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[Actor, str]:
        normalized_email = email.strip().lower()
        account = db.scalar(select(Account).where(Account.email == normalized_email))
        
        if not account:
            log_security_event(
                db,
                event_type=SecurityAuditEventType.LOGIN_FAILURE,
                ip_address=ip_address,
                user_agent=user_agent,
                details=f"Login failed for email: {normalized_email}",
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        is_valid, needs_rehash = verify_password(password, account.password_hash)
        if not is_valid:
            log_security_event(
                db,
                event_type=SecurityAuditEventType.LOGIN_FAILURE,
                actor_id=str(account.actor_id),
                account_id=str(account.id),
                ip_address=ip_address,
                user_agent=user_agent,
                details="Invalid password attempt.",
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if needs_rehash:
            account.password_hash = hash_password(password)

        actor = account.actor
        if not actor or not actor.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive or disabled.",
            )

        raw_session_token = generate_secure_token()
        session_obj = AuthSession(
            actor_id=actor.id,
            token_hash=hash_token(raw_session_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=cls.SESSION_DURATION_DAYS),
            last_seen_at=datetime.now(timezone.utc),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(session_obj)

        log_security_event(
            db,
            event_type=SecurityAuditEventType.LOGIN_SUCCESS,
            actor_id=str(actor.id),
            account_id=str(account.id),
            ip_address=ip_address,
            user_agent=user_agent,
            details="User login success.",
        )

        db.commit()

        return actor, raw_session_token

    @classmethod
    def get_session_actor(cls, db: Session, raw_token: str) -> Optional[Actor]:
        if not raw_token:
            return None
        token_h = hash_token(raw_token)
        session_obj = db.scalar(
            select(AuthSession).where(
                AuthSession.token_hash == token_h,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > datetime.now(timezone.utc),
            )
        )
        if not session_obj:
            return None

        session_obj.last_seen_at = datetime.now(timezone.utc)
        db.commit()
        return session_obj.actor

    @classmethod
    def logout_session(cls, db: Session, raw_token: str) -> None:
        if not raw_token:
            return
        token_h = hash_token(raw_token)
        session_obj = db.scalar(select(AuthSession).where(AuthSession.token_hash == token_h))
        if session_obj:
            session_obj.revoked_at = datetime.now(timezone.utc)
            log_security_event(
                db,
                event_type=SecurityAuditEventType.LOGOUT,
                actor_id=str(session_obj.actor_id),
                details="User session logged out.",
            )
            db.commit()

    @classmethod
    def change_password(
        cls, db: Session, actor: Actor, old_password: str, new_password: str, current_token: Optional[str] = None
    ) -> None:
        account = actor.account
        if not account:
            raise HTTPException(status_code=400, detail="No account record found.")

        is_valid, _ = verify_password(old_password, account.password_hash)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

        account.password_hash = hash_password(new_password)
        account.updated_at = datetime.now(timezone.utc)

        cls.revoke_other_sessions(db, actor.id, current_token)

        log_security_event(
            db,
            event_type=SecurityAuditEventType.PASSWORD_CHANGED,
            actor_id=str(actor.id),
            account_id=str(account.id),
            details="Password changed and other sessions revoked.",
        )
        db.commit()

    @classmethod
    def forgot_password(cls, db: Session, email: str) -> str:
        normalized_email = email.strip().lower()
        account = db.scalar(select(Account).where(Account.email == normalized_email))
        raw_reset_token = generate_secure_token()
        if account:
            reset_token = PasswordResetToken(
                actor_id=account.actor_id,
                token_hash=hash_token(raw_reset_token),
                expires_at=datetime.now(timezone.utc) + timedelta(hours=cls.TOKEN_EXPIRY_HOURS),
            )
            db.add(reset_token)
            log_security_event(
                db,
                event_type=SecurityAuditEventType.PASSWORD_RESET,
                actor_id=str(account.actor_id),
                account_id=str(account.id),
                details="Password reset token generated.",
            )
            db.commit()
        return raw_reset_token

    @classmethod
    def reset_password(cls, db: Session, raw_token: str, new_password: str) -> None:
        token_h = hash_token(raw_token)
        reset_token = db.scalar(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == token_h,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > datetime.now(timezone.utc),
            )
        )
        if not reset_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token.",
            )

        account = db.scalar(select(Account).where(Account.actor_id == reset_token.actor_id))
        if account:
            account.password_hash = hash_password(new_password)
            account.updated_at = datetime.now(timezone.utc)

        reset_token.used_at = datetime.now(timezone.utc)
        
        # Revoke ALL active sessions for this actor on password reset
        sessions = db.scalars(
            select(AuthSession).where(
                AuthSession.actor_id == reset_token.actor_id,
                AuthSession.revoked_at.is_(None),
            )
        ).all()
        for s in sessions:
            s.revoked_at = datetime.now(timezone.utc)

        log_security_event(
            db,
            event_type=SecurityAuditEventType.PASSWORD_RESET,
            actor_id=str(reset_token.actor_id),
            details="Password reset completed and all sessions revoked.",
        )
        db.commit()

    @classmethod
    def verify_email(cls, db: Session, raw_token: str) -> None:
        token_h = hash_token(raw_token)
        token_obj = db.scalar(
            select(EmailVerificationToken).where(
                EmailVerificationToken.token_hash == token_h,
                EmailVerificationToken.used_at.is_(None),
                EmailVerificationToken.expires_at > datetime.now(timezone.utc),
            )
        )
        if not token_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired email verification token.",
            )

        account = db.scalar(select(Account).where(Account.actor_id == token_obj.actor_id))
        if account:
            account.is_verified = True
            account.updated_at = datetime.now(timezone.utc)

        token_obj.used_at = datetime.now(timezone.utc)

        log_security_event(
            db,
            event_type=SecurityAuditEventType.EMAIL_VERIFIED,
            actor_id=str(token_obj.actor_id),
            details="Email successfully verified.",
        )
        db.commit()

    @classmethod
    def resend_verification(cls, db: Session, email: str) -> str:
        normalized_email = email.strip().lower()
        account = db.scalar(select(Account).where(Account.email == normalized_email))
        raw_verify_token = generate_secure_token()
        if account and not account.is_verified:
            # Invalidate old verification tokens
            old_tokens = db.scalars(
                select(EmailVerificationToken).where(
                    EmailVerificationToken.actor_id == account.actor_id,
                    EmailVerificationToken.used_at.is_(None),
                )
            ).all()
            for t in old_tokens:
                t.used_at = datetime.now(timezone.utc)

            verify_token = EmailVerificationToken(
                actor_id=account.actor_id,
                token_hash=hash_token(raw_verify_token),
                expires_at=datetime.now(timezone.utc) + timedelta(hours=cls.TOKEN_EXPIRY_HOURS),
            )
            db.add(verify_token)
            db.commit()
        return raw_verify_token

    @classmethod
    def get_active_sessions(cls, db: Session, actor_id: uuid.UUID) -> List[AuthSession]:
        return list(
            db.scalars(
                select(AuthSession).where(
                    AuthSession.actor_id == actor_id,
                    AuthSession.revoked_at.is_(None),
                    AuthSession.expires_at > datetime.now(timezone.utc),
                )
            ).all()
        )

    @classmethod
    def revoke_session(cls, db: Session, actor_id: uuid.UUID, session_id: uuid.UUID) -> None:
        session_obj = db.scalar(
            select(AuthSession).where(
                AuthSession.id == session_id,
                AuthSession.actor_id == actor_id,
            )
        )
        if session_obj:
            session_obj.revoked_at = datetime.now(timezone.utc)
            log_security_event(
                db,
                event_type=SecurityAuditEventType.SESSION_REVOKED,
                actor_id=str(actor_id),
                details=f"Session {session_id} revoked.",
            )
            db.commit()

    @classmethod
    def revoke_other_sessions(cls, db: Session, actor_id: uuid.UUID, current_token: Optional[str] = None) -> None:
        current_hash = hash_token(current_token) if current_token else None
        sessions = db.scalars(
            select(AuthSession).where(
                AuthSession.actor_id == actor_id,
                AuthSession.revoked_at.is_(None),
            )
        ).all()
        for s in sessions:
            if current_hash and s.token_hash == current_hash:
                continue
            s.revoked_at = datetime.now(timezone.utc)
        db.commit()
