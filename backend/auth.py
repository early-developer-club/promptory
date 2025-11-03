# auth.py (상단)
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import requests

# --- Environment Variables ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# SECRET_KEY 또는 JWT_SECRET_KEY 둘 중 하나 허용
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")

# 기본값 제공 (대시보드 값이 있으면 그걸 사용)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))

# 배포 도메인 기반 혹은 명시적 REDIRECT URI
BASE_URL = os.getenv("BASE_URL")  # 예: https://your-service.onrender.com
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI") or (
    f"{BASE_URL}/auth/google/callback" if BASE_URL else "http://127.0.0.1:8000/auth/google/callback"
)

missing = []
if not GOOGLE_CLIENT_ID: missing.append("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_SECRET: missing.append("GOOGLE_CLIENT_SECRET")
if not JWT_SECRET_KEY: missing.append("JWT_SECRET_KEY or SECRET_KEY")
if missing:
    raise ValueError(f"Missing env vars: {', '.join(missing)}")

# --- JWT ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

# --- Google OAuth ---
SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]

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

flow = Flow.from_client_config(
    client_config=client_config,
    scopes=SCOPES,
    redirect_uri=REDIRECT_URI,
)
