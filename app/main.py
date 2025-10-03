from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app import models, crud, schemas
from app.database import engine, Base, SessionLocal

# ---------------- Create tables ----------------
Base.metadata.create_all(bind=engine)

# ---------------- FastAPI ----------------
app = FastAPI(title="Criminal Case Management")

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Signup/Login ----------------
@app.post("/signup", response_model=schemas.UserRead)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    return crud.create_user(db, user)

@app.post("/login", response_model=schemas.UserRead)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if db_user.role != user.role:
        raise HTTPException(status_code=403, detail=f"You are not a {user.role}")
    return db_user

# ---------------- Officers ----------------
@app.get("/officers/{user_id}", response_model=schemas.OfficerRead)
def get_officer(user_id: int, db: Session = Depends(get_db)):
    officer = crud.get_officer_by_user_id(db, user_id)
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    return officer

# ---------------- Criminals ----------------
@app.get("/criminals", response_model=List[schemas.CriminalRead])
def get_criminals(db: Session = Depends(get_db)):
    return crud.get_criminals(db)

@app.get("/criminals/{criminal_id}", response_model=schemas.CriminalRead)
def get_criminal_by_id(criminal_id: int, db: Session = Depends(get_db)):
    db_criminal = crud.get_criminal(db, criminal_id)
    if not db_criminal:
        raise HTTPException(status_code=404, detail="Criminal not found")
    return db_criminal

@app.post("/criminals", response_model=schemas.CriminalRead)
def add_criminal(criminal: schemas.CriminalCreate, db: Session = Depends(get_db)):
    return crud.create_criminal(db, criminal)

@app.put("/criminals/{criminal_id}", response_model=schemas.CriminalRead)
def update_criminal(criminal_id: int, criminal: schemas.CriminalUpdate, db: Session = Depends(get_db)):
    return crud.update_criminal(db, criminal_id, criminal)

@app.delete("/criminals/{criminal_id}")
def delete_criminal(criminal_id: int, db: Session = Depends(get_db)):
    crud.delete_criminal(db, criminal_id)
    return {"message": "Criminal deleted successfully"}

# ---------------- Cases / FIRs ----------------
@app.get("/cases", response_model=List[schemas.FIRRead])
def get_cases(db: Session = Depends(get_db)):
    return crud.get_cases(db)

@app.get("/cases/{fir_id}", response_model=schemas.FIRRead)
def get_case(fir_id: int, db: Session = Depends(get_db)):
    db_case = crud.get_case(db, fir_id)
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case

@app.post("/cases", response_model=schemas.FIRRead)
def create_case(case: schemas.FIRCreate, db: Session = Depends(get_db), officer_id: int = 1):
    # officer_id comes from login in frontend
    return crud.create_case(db, case, officer_id)

@app.put("/cases/{fir_id}", response_model=schemas.FIRRead)
def update_case(fir_id: int, case: schemas.FIRUpdate, db: Session = Depends(get_db)):
    return crud.update_case(db, fir_id, case)

# ---------------- NOTE ----------------
# DELETE /cases endpoint removed as per requirements
