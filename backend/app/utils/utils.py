"""Utility functions for the FastAPI application."""

from typing import List
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt # type: ignore
from datetime import datetime, timedelta
from passlib.context import CryptContext # type: ignore
import os
import pytz # type: ignore
from dotenv import load_dotenv

load_dotenv(dotenv_path="app/.env")

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES"))
ACCESS_TOKEN_EXPIRE_MINUTES=30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash Password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify Password"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT Token"""
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    """Decode JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme)):  
    """Get the current user from the JWT token."""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

def has_permission(required_roles: List[str]):
    """Check if the user has the required roles to access the endpoint."""
    def permission_dependency(token: str = Depends(oauth2_scheme)):
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_role = payload.get("role")
        if user_role not in required_roles:
            raise HTTPException(
                status_code=403, detail=f"Insufficient permissions. Required role: {required_roles}"
            )
        return True
    return Depends(permission_dependency)

def convert_to_ist(call_time, lead_timezone):
    """Convert to timezone of any country to IST"""
    call_time = datetime.strptime(call_time, "%Y-%m-%d %H:%M:%S")
    # Lead's local timezone
    local_tz = pytz.timezone(lead_timezone)
    local_time = local_tz.localize(call_time)
    # Convert to IST
    ist_tz = pytz.timezone("Asia/Kolkata")
    ist_time = local_time.astimezone(ist_tz)
    #Removing timezone info
    naive_ist_time = ist_time.replace(tzinfo=None)
    return naive_ist_time
    
def convert_to_date_and_time(datetime_iso):
    iso_string = str(datetime_iso)
    date_time_obj = datetime.fromisoformat(iso_string)
    formatted_date = date_time_obj.strftime("%Y-%m-%d %I:%M %p").lower()
    return formatted_date