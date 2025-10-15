from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    parent_comment_id: Optional[int] = None

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(CommentBase):
    id: int
    task_id: int
    user_id: int
    parent_comment_id: Optional[int] = None
    is_edited: bool
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_avatar_url: Optional[str] = None
    replies: List['CommentResponse'] = []
    
    class Config:
        from_attributes = True

# Update forward references
CommentResponse.model_rebuild()
