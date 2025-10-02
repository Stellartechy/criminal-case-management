from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app import models, schemas

# ---------------- Password Hashing ----------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# ---------------- Users ----------------
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_obj = models.User(
        username=user.username,
        password=hashed_password,
        role=user.role
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ---------------- Criminals ----------------
def get_criminals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Criminal).offset(skip).limit(limit).all()

def create_criminal(db: Session, criminal: schemas.CriminalCreate):
    db_obj = models.Criminal(**criminal.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ---------------- Cases ----------------
def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Case).offset(skip).limit(limit).all()

def create_case(db: Session, case: schemas.CaseCreate):
    db_obj = models.Case(**case.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ---------------- Court ----------------
def get_courts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Court).offset(skip).limit(limit).all()

def create_court(db: Session, court: schemas.CourtCreate):
    db_obj = models.Court(**court.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
