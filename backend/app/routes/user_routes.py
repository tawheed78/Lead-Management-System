"""This module contains the routes for user registration, authentication and token generation."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ..utils.utils import decode_token
from ..configs.database.postgres_db import get_postgres_db
from ..models.postgres_models import UserModel
from ..schemas.postgres_schemas import UserCreate
from ..services.user_service import create_user, authenticate_user, create_access_token_for_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post('/register')
async def register_user(form_data: UserCreate, db = Depends(get_postgres_db)):
    """Registers a new user with the provided details."""
    existing_username = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    create_user(db, form_data.username, form_data.email, form_data.full_name, form_data.role, form_data.password)
    return {"message": "User registered successfully"}


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_postgres_db)):
    """Authenticates a user and generates an access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token_for_user(user)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    """Retrieves the details of the authenticated user."""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": payload["sub"], "role": payload["role"]}
