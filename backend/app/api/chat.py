from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.chat import ChatRoom
from app.schemas.chat import (
    ChatRoomResponse, ChatRoomWithMessages, MessageCreate, MessageResponse,
    WebSocketMessage
)
from app.services.chat_service import chat_service
from app.utils.websocket_manager import manager
from app.api.auth import get_current_user
from app.services.notification_service import notification_service

router = APIRouter()

@router.get("/rooms", response_model=List[ChatRoomResponse])
async def get_user_chat_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get private chat rooms for the current user"""
    rooms = chat_service.get_user_private_chat_rooms(db, current_user.id)
    
    result = []
    for room in rooms:
        # Get last message
        messages = chat_service.get_chat_messages(db, room.id, limit=1)
        last_message = None
        if messages:
            msg = messages[0]
            last_message = MessageResponse(
                id=msg.id,
                text=msg.text,
                sender_id=msg.sender_id,
                chat_id=msg.chat_id,
                timestamp=msg.timestamp,
                is_edited=msg.is_edited,
                edited_at=msg.edited_at,
                sender_full_name=msg.sender.full_name,
                sender_avatar_url=msg.sender.avatar_url
            )
        
        # Get participant IDs
        participant_ids = [p.id for p in room.participants]
        
        result.append(ChatRoomResponse(
            id=room.id,
            name=room.name,
            type=room.type,
            department_id=room.department_id,
            participants_ids=participant_ids,
            last_message=last_message,
            unread_count=0  # TODO: Implement unread count
        ))
    
    return result

@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages for a specific chat room"""
    # Check if user is in the chat
    if not chat_service.is_user_in_chat(db, current_user.id, chat_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this chat room"
        )
    
    messages = chat_service.get_chat_messages(db, chat_id)
    return [
        MessageResponse(
            id=msg.id,
            text=msg.text,
            sender_id=msg.sender_id,
            chat_id=msg.chat_id,
            timestamp=msg.timestamp,
            is_edited=msg.is_edited,
            edited_at=msg.edited_at,
            sender_full_name=msg.sender.full_name,
            sender_avatar_url=msg.sender.avatar_url
        )
        for msg in messages
    ]

@router.get("/private/{user_id}", response_model=ChatRoomResponse)
async def get_or_create_private_chat(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get or create a private chat with another user"""
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow chatting with yourself
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot create private chat with yourself")
    
    chat = chat_service.get_or_create_private_chat(db, current_user.id, user_id)
    
    # Get participant IDs
    participant_ids = [p.id for p in chat.participants]
    
    return ChatRoomResponse(
        id=chat.id,
        name=chat.name,
        type=chat.type,
        department_id=chat.department_id,
        participants_ids=participant_ids,
        last_message=None,
        unread_count=0
    )

@router.get("/department", response_model=ChatRoomResponse)
async def get_department_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get or create department chat for current user's department"""
    if not current_user.department_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a department")
    
    chat = chat_service.get_department_chat(db, current_user.department_id)
    
    # Get participant IDs
    participant_ids = [p.id for p in chat.participants]
    
    # Get last message
    messages = chat_service.get_chat_messages(db, chat.id, limit=1)
    last_message = None
    if messages:
        msg = messages[0]
        last_message = MessageResponse(
            id=msg.id,
            text=msg.text,
            sender_id=msg.sender_id,
            chat_id=msg.chat_id,
            timestamp=msg.timestamp,
            is_edited=msg.is_edited,
            edited_at=msg.edited_at,
            sender_full_name=msg.sender.full_name,
            sender_avatar_url=msg.sender.avatar_url
        )
    
    return ChatRoomResponse(
        id=chat.id,
        name=chat.name,
        type=chat.type,
        department_id=chat.department_id,
        participants_ids=participant_ids,
        last_message=last_message,
        unread_count=0
    )

@router.get("/company", response_model=ChatRoomResponse)
async def get_company_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get or create company-wide chat"""
    chat = chat_service.get_company_chat(db)
    
    # Get participant IDs
    participant_ids = [p.id for p in chat.participants]
    
    # Get last message
    messages = chat_service.get_chat_messages(db, chat.id, limit=1)
    last_message = None
    if messages:
        msg = messages[0]
        last_message = MessageResponse(
            id=msg.id,
            text=msg.text,
            sender_id=msg.sender_id,
            chat_id=msg.chat_id,
            timestamp=msg.timestamp,
            is_edited=msg.is_edited,
            edited_at=msg.edited_at,
            sender_full_name=msg.sender.full_name,
            sender_avatar_url=msg.sender.avatar_url
        )
    
    return ChatRoomResponse(
        id=chat.id,
        name=chat.name,
        type=chat.type,
        department_id=chat.department_id,
        participants_ids=participant_ids,
        last_message=last_message,
        unread_count=0
    )

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def create_message(
    chat_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new message in a chat room"""
    # Check if user is in the chat
    if not chat_service.is_user_in_chat(db, current_user.id, chat_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this chat room"
        )
    
    message = chat_service.create_message(db, message_data, current_user.id, chat_id)
    
    # Send notifications to other participants
    try:
        # Get chat room to determine type and participants
        chat_room = db.query(ChatRoom).filter(ChatRoom.id == chat_id).first()
        if chat_room:
            # Get all participants except the sender
            participants = [p for p in chat_room.participants if p.id != current_user.id]
            
            for participant in participants:
                notification_type = 'private_message'
                if chat_room.type == 'department':
                    notification_type = 'department_message'
                elif chat_room.type == 'company':
                    notification_type = 'company_message'
                
                notification_service.create_notification(
                    db=db,
                    user_id=participant.id,
                    notification_type=notification_type,
                    data={
                        'sender_name': current_user.full_name,
                        'chat_id': chat_id,
                        'message_preview': message.text[:100] + '...' if len(message.text) > 100 else message.text
                    }
                )
    except Exception as e:
        print(f"⚠️ Failed to send chat notification: {e}")
    
    return MessageResponse(
        id=message.id,
        text=message.text,
        sender_id=message.sender_id,
        chat_id=message.chat_id,
        timestamp=message.timestamp,
        is_edited=message.is_edited,
        edited_at=message.edited_at,
        sender_full_name=current_user.full_name,
        sender_avatar_url=current_user.avatar_url
    )

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time chat"""
    # Verify token
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # Get user from token
    user_email = payload.get("sub")
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        await websocket.close(code=1008, reason="User not found")
        return
    
    # Check if user is in the chat
    if not chat_service.is_user_in_chat(db, user.id, chat_id):
        await websocket.close(code=1008, reason="Access denied")
        return
    
    # Connect to chat room
    user_info = {
        "user_id": user.id,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url
    }
    await manager.connect(websocket, chat_id, user_info)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "message":
                # Create message in database
                message_create = MessageCreate(text=message_data["text"])
                message = chat_service.create_message(db, message_create, user.id, chat_id)
                
                # Broadcast to all participants
                ws_message = WebSocketMessage(
                    chat_id=chat_id,
                    sender_id=user.id,
                    text=message.text,
                    timestamp=message.timestamp,
                    sender_full_name=user.full_name,
                    sender_avatar_url=user.avatar_url,
                    type="message"
                )
                
                await manager.broadcast_to_chat(ws_message.dict(), chat_id)
            
            elif message_data.get("type") == "typing_start":
                # Broadcast typing indicator
                typing_data = {
                    "type": "typing_start",
                    "user_id": user.id,
                    "user_full_name": user.full_name,
                    "chat_id": chat_id
                }
                await manager.broadcast_to_chat(typing_data, chat_id)
            
            elif message_data.get("type") == "typing_end":
                # Broadcast typing end
                typing_data = {
                    "type": "typing_end",
                    "user_id": user.id,
                    "user_full_name": user.full_name,
                    "chat_id": chat_id
                }
                await manager.broadcast_to_chat(typing_data, chat_id)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
