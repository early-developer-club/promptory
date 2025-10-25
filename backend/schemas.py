from pydantic import BaseModel
from typing import List, Literal, Optional
import datetime

# --- Tag Schemas ---
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True

# --- Conversation Schemas ---
class ConversationBase(BaseModel):
    source: Literal["CHAT_GPT", "GEMINI"]
    prompt: str
    response: str
    conversation_timestamp: datetime.datetime

class ConversationCreate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: int
    owner_id: int
    created_at: datetime.datetime
    tags: List[Tag] = []

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str # Example for non-oauth

class User(UserBase):
    id: int
    conversations: List[Conversation] = []

    class Config:
        from_attributes = True
