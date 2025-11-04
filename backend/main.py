import os

# This line is for local development only, to allow OAuth over HTTP.
# Do not use this in production.
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

# Import modules
import models
import schemas
import database
import auth
import crud
import requests
from jose import JWTError, jwt

# Create all database tables on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Promptory API",
    description="API for backing up and managing AI conversations.",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Allows only the specified frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Database Dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Real Authentication Dependency ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, auth.JWT_SECRET_KEY, algorithms=[auth.ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Promptory API!"}

# --- Auth Endpoints ---

@app.get("/api/v1/auth/google")
def auth_google():
    """Generate a redirect to Google's OAuth 2.0 login page."""
    authorization_url, state = auth.flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    response = RedirectResponse(url=authorization_url)
    # Store the state in a cookie to prevent CSRF attacks
    response.set_cookie(key="state", value=state, httponly=True)
    return response

@app.get("/api/v1/auth/google/callback")
def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle the callback from Google after successful login."""
    # CSRF protection (Temporarily disabled for local development)
    # state = request.cookies.get("state")
    # if not state or state != request.query_params.get('state'):
    #     raise HTTPException(status_code=400, detail="Invalid state parameter")

    # Exchange the authorization code for an access token
    auth.flow.fetch_token(authorization_response=str(request.url))
    credentials = auth.flow.credentials

    # Get user info from Google
    user_info_response = requests.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {credentials.token}'}
    )
    user_info = user_info_response.json()

    # Get or create user in our database
    user = crud.get_or_create_user(db, user_info=user_info)

    # Create a JWT for our service
    access_token = auth.create_access_token(data={"sub": str(user.id)})

    # Redirect to the frontend callback URL with the token in the hash
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    response = RedirectResponse(url=f"{frontend_url}/auth/callback#access_token={access_token}")
    return response

# --- User Endpoints ---

@app.get("/api/v1/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Fetch the currently logged-in user."""
    return current_user

# --- Conversation Endpoints (Now Protected) ---

@app.get("/api/v1/conversations", response_model=List[schemas.Conversation])
def read_conversations(
    q: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve conversations for the current user, with optional search and date filters."""
    return crud.get_conversations(db=db, user_id=current_user.id, query=q, date=date)


@app.get("/api/v1/conversations/{conversation_id}", response_model=schemas.Conversation)
def read_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve a single conversation by its ID."""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.owner_id == current_user.id
    ).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@app.delete("/api/v1/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a conversation by its ID."""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.owner_id == current_user.id
    ).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    return

@app.get("/api/v1/statistics/summary")
def get_statistics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get summary statistics for the current user."""
    total_conversations = db.query(func.count(models.Conversation.id)).filter(models.Conversation.owner_id == current_user.id).scalar()

    by_source_query = db.query(
        models.Conversation.source, func.count(models.Conversation.id)
    ).filter(
        models.Conversation.owner_id == current_user.id
    ).group_by(
        models.Conversation.source
    ).all()

    by_source = {source: count for source, count in by_source_query}

    return {
        "total_conversations": total_conversations or 0,
        "by_source": by_source
    }

@app.get("/api/v1/statistics/tags")
def get_tag_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get tag frequency for the current user."""
    tags = crud.get_tag_frequency(db=db, user_id=current_user.id)
    return tags


@app.post("/api/v1/conversations", response_model=schemas.Conversation, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation: schemas.ConversationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    API-001: Receives conversation data from the Chrome extension and saves it.
    This endpoint is now protected and requires a valid JWT.
    """
    db_conversation = models.Conversation(
        **conversation.dict(),
        owner_id=current_user.id
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)

    # Extract keywords and create tags
    crud.extract_and_add_tags(db, db_conversation)

    # Refresh again to load the tags
    db.refresh(db_conversation)

    return db_conversation
