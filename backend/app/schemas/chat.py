from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    chat_id: int
    timestamp: datetime
    is_edited: int
    edited_at: Optional[datetime]
    sender_full_name: str
    sender_avatar_url: Optional[str]

    class Config:
        from_attributes = True

class ChatRoomBase(BaseModel):
    name: Optional[str] = None
    type: str

class ChatRoomCreate(ChatRoomBase):
    pass

class ChatRoomResponse(ChatRoomBase):
    id: int
    department_id: Optional[int]
    participants_ids: List[int] = []
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0

    class Config:
        from_attributes = True

class ChatRoomWithMessages(ChatRoomResponse):
    messages: List[MessageResponse] = []

class WebSocketMessage(BaseModel):
    chat_id: int
    sender_id: int
    text: str
    timestamp: datetime
    sender_full_name: str
    sender_avatar_url: Optional[str]
    type: str = "message"  # "message", "typing_start", "typing_end"

class TypingIndicator(BaseModel):
    chat_id: int
    user_id: int
    user_full_name: str
    is_typing: bool
    type: str = "typing_indicator"
