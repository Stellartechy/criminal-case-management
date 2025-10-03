from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

# ---------------- Users ----------------
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, password=user.password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if user and user.password == password:
        return user
    return None

# ---------------- Police Officers ----------------
def get_officer_by_user_id(db: Session, user_id: int):
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.user_id == user_id).first()

def get_officer_by_id(db: Session, officer_id: int):
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.officer_id == officer_id).first()

# ---------------- Criminals ----------------
def get_criminals(db: Session) -> List[models.Criminal]:
    return db.query(models.Criminal).all()

def get_criminal(db: Session, criminal_id: int):
    return db.query(models.Criminal).filter(models.Criminal.criminal_id == criminal_id).first()

def create_criminal(db: Session, criminal: schemas.CriminalCreate):
    db_criminal = models.Criminal(**criminal.dict())
    db.add(db_criminal)
    db.commit()
    db.refresh(db_criminal)
    return db_criminal

def update_criminal(db: Session, criminal_id: int, criminal: schemas.CriminalUpdate):
    db_criminal = get_criminal(db, criminal_id)
    if db_criminal:
        for key, value in criminal.dict(exclude_unset=True).items():
            setattr(db_criminal, key, value)
        db.commit()
        db.refresh(db_criminal)
    return db_criminal

def delete_criminal(db: Session, criminal_id: int):
    db_criminal = get_criminal(db, criminal_id)
    if db_criminal:
        db.delete(db_criminal)
        db.commit()
    return True

# ---------------- FIR / Cases ----------------
def get_cases(db: Session):
    cases = db.query(models.FIR).all()
    result = []
    for c in cases:
        officer_name = c.officer.name if c.officer else None
        criminals = [
            {
                "criminal_id": cr.criminal_id,
                "name": cr.name,
                "age": cr.age,
                "gender": cr.gender,
                "address": cr.address,
                "status": cr.status,
                "firs": []
            }
            for cr in c.criminals
        ]
        result.append({
            "fir_id": c.fir_id,
            "officer_id": c.officer_id,
            "officer_name": officer_name,
            "fir_date": c.fir_date,
            "case_status": c.case_status,
            "crime_type": c.crime_type,
            "crime_date": c.crime_date,
            "crime_description": c.crime_description,
            "verdict": c.verdict,
            "punishment_type": c.punishment_type,
            "punishment_duration_years": c.punishment_duration_years,
            "punishment_start_date": c.punishment_start_date,
            "criminals": criminals
        })
    return result

def get_case(db: Session, fir_id: int):
    case = db.query(models.FIR).filter(models.FIR.fir_id == fir_id).first()
    if case:
        case.officer_name = case.officer.name if case.officer else None
    return case

def create_case(db: Session, case: schemas.FIRCreate, officer_id: int):
    db_case = models.FIR(
        fir_date=case.fir_date,
        case_status=getattr(case, "case_status", "Open"),
        crime_type=case.crime_type,
        crime_date=case.crime_date,
        crime_description=case.crime_description,
        verdict=getattr(case, "verdict", "Pending"),
        punishment_type=case.punishment_type,
        punishment_duration_years=case.punishment_duration_years,
        punishment_start_date=case.punishment_start_date,
        officer_id=officer_id
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    for cid in case.criminal_ids:
        criminal = db.query(models.Criminal).filter(models.Criminal.criminal_id == cid).first()
        if criminal:
            db_case.criminals.append(criminal)
    db.commit()
    db.refresh(db_case)

    db_case.officer_name = db_case.officer.name if db_case.officer else None
    return db_case

def update_case(db: Session, fir_id: int, case: schemas.FIRUpdate):
    db_case = get_case(db, fir_id)
    if db_case:
        for key, value in case.dict(exclude_unset=True).items():
            setattr(db_case, key, value)
        db.commit()
        db.refresh(db_case)
        db_case.officer_name = db_case.officer.name if db_case.officer else None
    return db_case
