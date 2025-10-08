
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import database setup, models, and schemas
import models
import schemas
import database

# Create all database tables
# This is a simple way to ensure tables are created on startup.
# For production, you would use a migration tool like Alembic.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Promptory API",
    description="API for backing up and managing AI conversations.",
    version="0.1.0"
)

# --- Database Dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Authentication (Placeholder) ---
# TODO: Implement real JWT-based authentication
def get_current_user(db: Session = Depends(get_db)):
    # For now, fetch or create a dummy user from the DB for demonstration.
    dummy_user = db.query(models.User).filter(models.User.email == "user@example.com").first()
    if not dummy_user:
        dummy_user = models.User(email="user@example.com", provider="dummy")
        db.add(dummy_user)
        db.commit()
        db.refresh(dummy_user)
    return dummy_user

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Promptory API!"}

@app.post("/api/v1/conversations", response_model=schemas.Conversation, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation: schemas.ConversationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    API-001: Receives conversation data from the Chrome extension and saves it.
    """
    db_conversation = models.Conversation(
        **conversation.dict(),
        owner_id=current_user.id
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    
    print(f"Conversation {db_conversation.id} from user {current_user.email} saved to DB.")

    # TODO: [Async Job] Trigger the summarization and auto-tagging job (JOB-001).
    print(f"TODO: Trigger async job JOB-001 for conversationId: {db_conversation.id}")

    return db_conversation

# To run this app:
# 1. Create a .env file with DATABASE_URL (see .env.example)
# 2. Install dependencies: pip install -r requirements.txt
# 3. Run the server: uvicorn main:app --reload
