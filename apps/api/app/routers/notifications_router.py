import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.actor import Actor
from app.schemas.notification_schema import NotificationListResponse, NotificationResponse
from app.services.notification_service import (
    list_user_notifications,
    mark_notification_read,
    mark_all_notifications_read,
)

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    summary="List notifications for current authenticated user",
)
def get_my_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    items, total, unread_count = list_user_notifications(
        db, recipient_actor_id=current_actor.id, limit=limit, offset=offset
    )
    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        total=total,
        unread_count=unread_count,
    )


@router.post(
    "/{notification_id}/read",
    summary="Mark notification as read",
)
def mark_read_endpoint(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    success = mark_notification_read(db, notification_id, current_actor.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied.",
        )
    return {"status": "ok", "message": "Notification marked as read."}


@router.post(
    "/read-all",
    summary="Mark all notifications as read for current user",
)
def mark_all_read_endpoint(
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    count = mark_all_notifications_read(db, current_actor.id)
    return {"status": "ok", "count": count}
