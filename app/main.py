# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from . import models
from .database import engine, Base, get_db

# ------------------ Create Database Tables ------------------
Base.metadata.create_all(bind=engine)

# ------------------ FastAPI App ------------------
app = FastAPI(title="Criminal Case Management")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Password Hashing ------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# ------------------ Pydantic Schemas ------------------
class UserBase(BaseModel):
    username: str
    password: str
    role: str  # "admin", "police", "court"

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class UserRead(BaseModel):
    user_id: int
    username: str
    role: str

    class Config:
        orm_mode = True

# ------------------ Signup Endpoint ------------------
@app.post("/signup")
def signup(user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(username=user.username, password=hashed_pw, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

# ------------------ Login Endpoint ------------------
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if db_user.role != user.role:
        raise HTTPException(status_code=403, detail=f"You are not a {user.role}")
    return {"message": "Login successful", "role": db_user.role, "user_id": db_user.user_id}

# ------------------ Users Endpoint ------------------
@app.get("/users", response_model=list[UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.User).offset(skip).limit(limit).all()
