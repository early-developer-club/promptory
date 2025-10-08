
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Literal
import datetime

# --- Pydantic Models (Data Transfer Objects) ---
# Based on the detailed specification

class ConversationCreate(BaseModel):
    source: Literal["CHAT_GPT", "GEMINI"]
    prompt: str
    response: str
    conversationTimestamp: datetime.datetime

class ConversationResponse(BaseModel):
    success: bool
    conversationId: str

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Promptory API",
    description="API for backing up and managing AI conversations.",
    version="0.1.0"
)

# --- Authentication (Placeholder) ---
# TODO: Implement real JWT-based authentication
def get_current_user():
    # For now, this is a placeholder. In a real app, this would
    # decode a JWT token from the Authorization header.
    print("Dependency: get_current_user called. Returning a dummy user.")
    return {"userId": "dummy_user_id"}

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Promptory API!"}

@app.post("/api/v1/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    API-001: Receives conversation data from the Chrome extension and saves it.
    """
    print(f"Received conversation from user: {current_user['userId']}")
    print(f"Source: {conversation.source}, Timestamp: {conversation.conversationTimestamp}")

    # TODO: [Database] Save the conversation to the database, linking it to the userId.
    # new_conversation = db.Conversations(
    #     userId=current_user['userId'],
    *#     **conversation.dict()
    # )
    # db.session.add(new_conversation)
    # db.session.commit()
    
    # For now, we'll just simulate a successful save.
    new_conversation_id = "simulated-uuid-" + str(datetime.datetime.utcnow().timestamp())
    print(f"Simulating save. New conversation ID: {new_conversation_id}")

    # TODO: [Async Job] Trigger the summarization and auto-tagging job (JOB-001).
    # background_tasks.add_task(process_conversation_summary, new_conversation_id)
    print(f"TODO: Trigger async job JOB-001 for conversationId: {new_conversation_id}")

    return {"success": True, "conversationId": new_conversation_id}

# To run this app:
# 1. Install dependencies: pip install -r requirements.txt
# 2. Run the server: uvicorn main:app --reload
