import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: uuid.UUID
    recipient_actor_id: uuid.UUID
    type: str
    title: str
    message: str
    resource_type: Optional[str] = None
    resource_id: Optional[uuid.UUID] = None
    created_at: datetime
    read_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
