"""This module contains services for User Management."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import UserModel
from ..utils.utils import hash_password, verify_password, create_access_token

def get_user_by_username(db: Session, username: str):
    """Retrieve a user by their username."""
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, username: str, email: str, full_name: str, role: str, password: str):
    """Create a new user with hashed password."""
    hashed_password = hash_password(password)
    try:
        new_user = UserModel(username=username,
                            email=email,
                            full_name=full_name,
                            role=role,
                            password=hashed_password
                            )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    
def authenticate_user(db: Session, username: str, password: str):
    """Authenticate a user by verifying their password."""
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.password):
        return None
    return user

def create_access_token_for_user(user):
    """Create an access token for a user."""
    return create_access_token(data={"sub": user.username, "role": user.role})
