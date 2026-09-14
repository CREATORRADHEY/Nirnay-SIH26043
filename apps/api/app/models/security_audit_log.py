import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.models.base import Base

class SecurityAuditLog(Base):
    __tablename__ = "security_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(64), nullable=False, index=True)
    actor_id = Column(String(36), nullable=True, index=True)
    account_id = Column(String(36), nullable=True, index=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(256), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
