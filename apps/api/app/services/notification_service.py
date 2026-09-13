import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.notification import Notification


def create_notification(
    db: Session,
    recipient_actor_id: uuid.UUID,
    type: str,
    title: str,
    message: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[uuid.UUID] = None,
) -> Notification:
    notif = Notification(
        recipient_actor_id=recipient_actor_id,
        type=type,
        title=title,
        message=message,
        resource_type=resource_type,
        resource_id=resource_id,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def list_user_notifications(
    db: Session, recipient_actor_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> Tuple[List[Notification], int, int]:
    query = db.query(Notification).filter(Notification.recipient_actor_id == recipient_actor_id)
    total = query.count()
    unread_count = query.filter(Notification.read_at.is_(None)).count()
    items = (
        query.order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total, unread_count


def mark_notification_read(
    db: Session, notification_id: uuid.UUID, recipient_actor_id: uuid.UUID
) -> bool:
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.recipient_actor_id == recipient_actor_id,
        )
        .first()
    )
    if not notif:
        return False
    if notif.read_at is None:
        notif.read_at = datetime.now(timezone.utc)
        db.commit()
    return True


def mark_all_notifications_read(db: Session, recipient_actor_id: uuid.UUID) -> int:
    now = datetime.now(timezone.utc)
    updated = (
        db.query(Notification)
        .filter(
            Notification.recipient_actor_id == recipient_actor_id,
            Notification.read_at.is_(None),
        )
        .update({Notification.read_at: now}, synchronize_session=False)
    )
    db.commit()
    return updated
