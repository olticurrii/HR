from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.models.comment import Comment
from app.models.task import Task
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.api.auth import get_current_user

router = APIRouter()

def build_comment_tree(comments: List[Comment]) -> List[CommentResponse]:
    """Build a tree structure of comments with replies"""
    comment_dict = {}
    root_comments = []
    
    # First pass: create all comment responses
    for comment in comments:
        comment_dict[comment.id] = CommentResponse(
            id=comment.id,
            content=comment.content,
            task_id=comment.task_id,
            user_id=comment.user_id,
            parent_comment_id=comment.parent_comment_id,
            is_edited=comment.is_edited,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            user_name=comment.user.full_name if comment.user else None,
            user_avatar_url=comment.user.avatar_url if comment.user else None,
            replies=[]
        )
    
    # Second pass: build the tree structure
    for comment in comments:
        comment_response = comment_dict[comment.id]
        if comment.parent_comment_id is None:
            root_comments.append(comment_response)
        else:
            if comment.parent_comment_id in comment_dict:
                comment_dict[comment.parent_comment_id].replies.append(comment_response)
    
    return root_comments

@router.get("/tasks/{task_id}/comments", response_model=List[CommentResponse])
async def get_task_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a specific task"""
    # Check if task exists and user has access
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check visibility (same logic as task access)
    if not current_user.is_admin:
        if task.is_private and task.assignee_id != current_user.id and task.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this task"
            )
    
    # Get all comments for this task with user information
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    
    return build_comment_tree(comments)

@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    task_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment on a task"""
    # Check if task exists and user has access
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check visibility (same logic as task access)
    if not current_user.is_admin:
        if task.is_private and task.assignee_id != current_user.id and task.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this task"
            )
    
    # If this is a reply, check if parent comment exists and belongs to the same task
    if comment.parent_comment_id:
        parent_comment = db.query(Comment).filter(
            Comment.id == comment.parent_comment_id,
            Comment.task_id == task_id
        ).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    # Create the comment
    db_comment = Comment(
        content=comment.content,
        task_id=task_id,
        user_id=current_user.id,
        parent_comment_id=comment.parent_comment_id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Load user information for response
    db_comment = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.id == db_comment.id)
        .first()
    )
    
    return CommentResponse(
        id=db_comment.id,
        content=db_comment.content,
        task_id=db_comment.task_id,
        user_id=db_comment.user_id,
        parent_comment_id=db_comment.parent_comment_id,
        is_edited=db_comment.is_edited,
        created_at=db_comment.created_at,
        updated_at=db_comment.updated_at,
        user_name=db_comment.user.full_name if db_comment.user else None,
        user_avatar_url=db_comment.user.avatar_url if db_comment.user else None,
        replies=[]
    )

@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a comment (only by the author)"""
    comment = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.id == comment_id)
        .first()
    )
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only the author can edit their comment
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )
    
    comment.content = comment_update.content
    comment.is_edited = True
    db.commit()
    db.refresh(comment)
    
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        task_id=comment.task_id,
        user_id=comment.user_id,
        parent_comment_id=comment.parent_comment_id,
        is_edited=comment.is_edited,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        user_name=comment.user.full_name if comment.user else None,
        user_avatar_url=comment.user.avatar_url if comment.user else None,
        replies=[]
    )

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (only by the author or admin)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only the author or admin can delete comments
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}
