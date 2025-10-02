from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from typing import List, Optional
from app import models, crud, schemas
from app.database import engine, Base, get_db

# ------------------ Create Database Tables ------------------
Base.metadata.create_all(bind=engine)

# ------------------ FastAPI App ------------------
app = FastAPI(title="Criminal Case Management")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Password Hashing ------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password[:72], hashed_password)

# ------------------ Signup Endpoint ------------------
@app.post("/signup", response_model=schemas.UserRead)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    return crud.create_user(db, user)

# ------------------ Login Endpoint ------------------
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if db_user.role != user.role:
        raise HTTPException(status_code=403, detail=f"You are not a {user.role}")
    return {"message": "Login successful", "role": db_user.role, "user_id": db_user.user_id}

# ------------------ Users Endpoint ------------------
@app.get("/users", response_model=List[schemas.UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

# ------------------ Criminals Endpoints ------------------
@app.get("/criminals", response_model=List[schemas.CriminalRead])
def read_criminals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_criminals(db, skip=skip, limit=limit)

@app.post("/criminals", response_model=schemas.CriminalRead)
def create_criminal(criminal: schemas.CriminalCreate, db: Session = Depends(get_db)):
    return crud.create_criminal(db, criminal)

@app.get("/police/criminals", response_model=List[schemas.CriminalRead])
def get_criminals_police(
    station: Optional[str] = None,
    crime: Optional[str] = None,
    age: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return crud.get_criminals_filtered(db, station=station, crime=crime, age=age)

# ------------------ Cases Endpoints ------------------
@app.get("/cases", response_model=List[schemas.CaseRead])
def read_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_cases(db, skip=skip, limit=limit)

@app.get("/police/cases", response_model=List[schemas.CaseRead])
def get_cases_police(officer_id: Optional[int] = None, db: Session = Depends(get_db)):
    cases = crud.get_cases_police(db)
    if officer_id:
        cases = [c for c in cases if c.get("officer_id") == officer_id]
    return cases

@app.post("/cases", response_model=schemas.CaseRead)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    # Ensure criminal exists
    criminal = db.query(models.Criminal).filter(models.Criminal.criminal_id == case.criminal_id).first()
    if not criminal:
        raise HTTPException(status_code=404, detail="Criminal not found. Please register criminal first.")

    # If officer_id provided, ensure it exists
    if case.officer_id:
        officer = db.query(models.PoliceOfficer).filter(models.PoliceOfficer.officer_id == case.officer_id).first()
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")

    return crud.create_case(db, case)

# ------------------ Courts Endpoints ------------------
@app.get("/courts", response_model=List[schemas.CourtRead])
def read_courts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_courts(db, skip=skip, limit=limit)

@app.post("/courts", response_model=schemas.CourtRead)
def create_court(court: schemas.CourtCreate, db: Session = Depends(get_db)):
    # Ensure case exists
    db_case = db.query(models.Case).filter(models.Case.case_id == court.case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return crud.create_court(db, court)
