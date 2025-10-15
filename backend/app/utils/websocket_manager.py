from typing import Dict, List, Set
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections by chat room ID
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Dictionary to store user info for each connection
        self.user_connections: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, chat_id: int, user_info: dict):
        await websocket.accept()
        
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        
        self.active_connections[chat_id].append(websocket)
        self.user_connections[websocket] = {
            "chat_id": chat_id,
            "user_id": user_info["user_id"],
            "full_name": user_info["full_name"]
        }

    def disconnect(self, websocket: WebSocket):
        if websocket in self.user_connections:
            user_info = self.user_connections[websocket]
            chat_id = user_info["chat_id"]
            
            if chat_id in self.active_connections:
                if websocket in self.active_connections[chat_id]:
                    self.active_connections[chat_id].remove(websocket)
                
                # Remove empty chat room
                if not self.active_connections[chat_id]:
                    del self.active_connections[chat_id]
            
            del self.user_connections[websocket]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_chat(self, message: dict, chat_id: int, exclude_websocket: WebSocket = None):
        if chat_id in self.active_connections:
            message_text = json.dumps(message, default=str)
            for connection in self.active_connections[chat_id]:
                if exclude_websocket is None or connection != exclude_websocket:
                    try:
                        await connection.send_text(message_text)
                    except:
                        # Remove broken connection
                        self.disconnect(connection)

    def get_chat_participants(self, chat_id: int) -> List[dict]:
        participants = []
        if chat_id in self.active_connections:
            for websocket in self.active_connections[chat_id]:
                if websocket in self.user_connections:
                    user_info = self.user_connections[websocket]
                    participants.append({
                        "user_id": user_info["user_id"],
                        "full_name": user_info["full_name"]
                    })
        return participants

manager = ConnectionManager()
