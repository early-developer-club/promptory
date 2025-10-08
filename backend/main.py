import os

# This line is for local development only, to allow OAuth over HTTP.
# Do not use this in production.
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt

# Import modules
import models
import schemas
import database
import auth
import crud
import requests

# Create all database tables on startup
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

# --- Real Authentication Dependency ---
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
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

@app.get("/auth/google")
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

@app.get("/auth/google/callback")
def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle the callback from Google after successful login."""
    # CSRF protection
    state = request.cookies.get("state")
    if not state or state != request.query_params.get('state'):
        raise HTTPException(status_code=400, detail="Invalid state parameter")

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

    # Set the JWT in an HTTPOnly cookie and redirect
    response = RedirectResponse(url="http://localhost:3000/dashboard") # Redirect to frontend
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, # Prevents JS access
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite='lax'
    )
    return response

# --- User Endpoints ---

@app.get("/api/v1/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Fetch the currently logged-in user."""
    return current_user

# --- Conversation Endpoints (Now Protected) ---

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
    
    print(f"Conversation {db_conversation.id} from user {current_user.email} saved to DB.")

    # TODO: [Async Job] Trigger the summarization and auto-tagging job (JOB-001).
    print(f"TODO: Trigger async job JOB-001 for conversationId: {db_conversation.id}")

    return db_conversation
