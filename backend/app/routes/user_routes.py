from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ..utils.utils import hash_password, verify_password, create_access_token, decode_token
from ..configs.database.postgres_db import get_postgres_db
from ..models.postgres_models import UserModel
from ..schemas.schemas import UserCreate

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post('/register')
async def register_user(form_data: UserCreate, db = Depends(get_postgres_db)):
    existing_username = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = hash_password(form_data.password)
    new_user = UserModel(username=form_data.username, email=form_data.email, full_name=form_data.full_name, role=form_data.role, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_postgres_db)):
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": form_data.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": payload["sub"], "role": payload["role"]}
