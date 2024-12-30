from sqlalchemy.orm import Session
from ..models.postgres_models import UserModel
from ..utils.utils import hash_password, verify_password, create_access_token

def get_user_by_username(db: Session, username: str):
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, username: str, email: str, full_name: str, role: str, password: str):
    hashed_password = hash_password(password)
    new_user = UserModel(username=username, email=email, full_name=full_name, role=role, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.password):
        return None
    return user

def create_access_token_for_user(user):
    return create_access_token(data={"sub": user.username, "role": user.role})
