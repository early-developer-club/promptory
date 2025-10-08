import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import requests

# --- Environment Variables ---
# These are loaded from the .env file when the app starts
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET_KEY]):
    raise ValueError("Missing one or more required environment variables for auth.")

# --- JWT Configuration ---
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # One week

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Google OAuth Configuration ---

# This is the URL we will direct the user to for the Google login page.
# It must match one of the "Authorized redirect URIs" in your Google Cloud Console.
REDIRECT_URI = "http://127.0.0.1:8000/auth/google/callback"

# This defines what information we are asking for from Google.
SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]

# Create a client_config dictionary manually from environment variables
client_config = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "redirect_uris": [REDIRECT_URI],
    }
}

# Create a Flow instance using the from_client_config method
flow = Flow.from_client_config(
    client_config=client_config,
    scopes=SCOPES,
    redirect_uri=REDIRECT_URI,
)


