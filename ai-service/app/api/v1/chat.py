from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.openai_service import openai_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    context: Optional[Dict] = None

@router.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    messages = request.history.copy() if request.history else []
    messages.append({
        "role": "user",
        "content": request.message
    })
    
    return StreamingResponse(
        openai_service.stream_chat(messages),
        media_type="text/event-stream"
    )
