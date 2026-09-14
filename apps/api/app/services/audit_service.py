from typing import Optional
from sqlalchemy.orm import Session
from app.models.security_audit_log import SecurityAuditLog
from app.core.enums import SecurityAuditEventType

def log_security_event(
    db: Session,
    event_type: SecurityAuditEventType,
    actor_id: Optional[str] = None,
    account_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[str] = None,
) -> SecurityAuditLog:
    log_entry = SecurityAuditLog(
        event_type=event_type.value if isinstance(event_type, SecurityAuditEventType) else str(event_type),
        actor_id=actor_id,
        account_id=account_id,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
