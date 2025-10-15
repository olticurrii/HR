from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from datetime import datetime

from app.models.chat import ChatRoom, Message, chat_participants
from app.models.user import User
from app.models.department import Department
from app.schemas.chat import ChatRoomCreate, MessageCreate

class ChatService:
    def get_user_chat_rooms(self, db: Session, user_id: int) -> List[ChatRoom]:
        """Get all chat rooms for a user"""
        return (
            db.query(ChatRoom)
            .join(chat_participants, ChatRoom.id == chat_participants.c.chat_id)
            .filter(chat_participants.c.user_id == user_id)
            .options(joinedload(ChatRoom.messages))
            .order_by(desc(ChatRoom.updated_at))
            .all()
        )

    def get_user_private_chat_rooms(self, db: Session, user_id: int) -> List[ChatRoom]:
        """Get only private chat rooms for a user"""
        return (
            db.query(ChatRoom)
            .join(chat_participants, ChatRoom.id == chat_participants.c.chat_id)
            .filter(
                and_(
                    chat_participants.c.user_id == user_id,
                    ChatRoom.type == "private"
                )
            )
            .options(joinedload(ChatRoom.messages))
            .order_by(desc(ChatRoom.updated_at))
            .all()
        )

    def get_chat_messages(self, db: Session, chat_id: int, limit: int = 50) -> List[Message]:
        """Get messages for a chat room"""
        return (
            db.query(Message)
            .filter(Message.chat_id == chat_id)
            .options(joinedload(Message.sender))
            .order_by(desc(Message.timestamp))
            .limit(limit)
            .all()
        )

    def get_or_create_private_chat(self, db: Session, user1_id: int, user2_id: int) -> ChatRoom:
        """Get or create a private chat between two users"""
        # Check if private chat already exists
        existing_chat = (
            db.query(ChatRoom)
            .filter(ChatRoom.type == "private")
            .join(chat_participants, ChatRoom.id == chat_participants.c.chat_id)
            .filter(chat_participants.c.user_id.in_([user1_id, user2_id]))
            .group_by(ChatRoom.id)
            .having(func.count(chat_participants.c.user_id) == 2)
            .first()
        )
        
        if existing_chat:
            return existing_chat
        
        # Create new private chat
        chat = ChatRoom(type="private")
        db.add(chat)
        db.flush()  # Get the ID
        
        # Add participants
        db.execute(
            chat_participants.insert().values([
                {"chat_id": chat.id, "user_id": user1_id},
                {"chat_id": chat.id, "user_id": user2_id}
            ])
        )
        
        db.commit()
        db.refresh(chat)
        
        # Load the participants relationship
        chat = (
            db.query(ChatRoom)
            .options(joinedload(ChatRoom.participants))
            .filter(ChatRoom.id == chat.id)
            .first()
        )
        
        return chat

    def get_department_chat(self, db: Session, department_id: int) -> ChatRoom:
        """Get or create department chat room"""
        chat = db.query(ChatRoom).filter(
            and_(
                ChatRoom.type == "department",
                ChatRoom.department_id == department_id
            )
        ).first()
        
        if not chat:
            # Create new department chat
            chat = ChatRoom(
                type="department",
                department_id=department_id,
                name=f"Department Chat"
            )
            db.add(chat)
            db.flush()  # Get the ID
            
            # Add all department employees as participants
            department_users = db.query(User).filter(User.department_id == department_id).all()
            for user in department_users:
                db.execute(
                    chat_participants.insert().values(
                        {"chat_id": chat.id, "user_id": user.id}
                    )
                )
            
            db.commit()
            db.refresh(chat)
        
        return chat

    def get_company_chat(self, db: Session) -> ChatRoom:
        """Get or create company-wide chat room"""
        chat = db.query(ChatRoom).filter(ChatRoom.type == "company").first()
        
        if not chat:
            # Create new company chat
            chat = ChatRoom(
                type="company",
                name="Company Chat"
            )
            db.add(chat)
            db.flush()  # Get the ID
            
            # Add all users as participants
            all_users = db.query(User).all()
            for user in all_users:
                db.execute(
                    chat_participants.insert().values(
                        {"chat_id": chat.id, "user_id": user.id}
                    )
                )
            
            db.commit()
            db.refresh(chat)
        
        return chat

    def create_message(self, db: Session, message_data: MessageCreate, sender_id: int, chat_id: int) -> Message:
        """Create a new message"""
        message = Message(
            text=message_data.text,
            sender_id=sender_id,
            chat_id=chat_id
        )
        db.add(message)
        
        # Update chat room timestamp
        chat = db.query(ChatRoom).filter(ChatRoom.id == chat_id).first()
        if chat:
            chat.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(message)
        return message

    def get_chat_by_id(self, db: Session, chat_id: int) -> Optional[ChatRoom]:
        """Get chat room by ID"""
        return db.query(ChatRoom).filter(ChatRoom.id == chat_id).first()

    def is_user_in_chat(self, db: Session, user_id: int, chat_id: int) -> bool:
        """Check if user is a participant in the chat"""
        result = db.query(chat_participants).filter(
            and_(
                chat_participants.c.user_id == user_id,
                chat_participants.c.chat_id == chat_id
            )
        ).first()
        return result is not None

chat_service = ChatService()
