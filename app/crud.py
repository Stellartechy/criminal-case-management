from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException

# ---------------- Users ----------------
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username==username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, password=user.password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user.role == "police":
        officer = models.PoliceOfficer(
            user_id=db_user.user_id,
            name=user.name,
            rank_title=user.rank_title,
            station=user.station
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
    
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or user.password != password:
        return None
    return user

# ---------------- Officers ----------------
def get_officer_by_user_id(db: Session, user_id: int):
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.user_id==user_id).first()

# ---------------- Criminals ----------------
def get_criminals(db: Session):
    return db.query(models.Criminal).all()

def get_criminal(db: Session, criminal_id: int):
    return db.query(models.Criminal).filter(models.Criminal.criminal_id==criminal_id).first()

def create_criminal(db: Session, criminal: schemas.CriminalCreate):
    db_criminal = models.Criminal(**criminal.dict())
    db.add(db_criminal)
    db.commit()
    db.refresh(db_criminal)
    return db_criminal

def update_criminal(db: Session, criminal_id: int, criminal: schemas.CriminalUpdate):
    db_criminal = get_criminal(db, criminal_id)
    if not db_criminal:
        raise HTTPException(status_code=404, detail="Criminal not found")
    for key, value in criminal.dict(exclude_unset=True).items():
        setattr(db_criminal, key, value)
    db.commit()
    db.refresh(db_criminal)
    return db_criminal

def delete_criminal(db: Session, criminal_id: int):
    db_criminal = get_criminal(db, criminal_id)
    if not db_criminal:
        raise HTTPException(status_code=404, detail="Criminal not found")
    db.delete(db_criminal)
    db.commit()

# ---------------- FIR / Cases ----------------
def get_cases(db: Session):
    cases = db.query(models.FIR).all()
    result = []
    for c in cases:
        officer_name = c.officer.name if c.officer else None
        criminals = [ {"criminal_id": crim.criminal_id, "name": crim.name, "age": crim.age, "gender": crim.gender, "address": crim.address, "status": crim.status} for crim in c.criminals]
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
    return db.query(models.FIR).filter(models.FIR.fir_id==fir_id).first()

def create_case(db: Session, case: schemas.FIRCreate, officer_id: int):
    db_case = models.FIR(
        officer_id=officer_id,
        fir_date=case.fir_date,
        case_status=case.case_status,
        crime_type=case.crime_type,
        crime_date=case.crime_date,
        crime_description=case.crime_description,
        verdict=case.verdict,
        punishment_type=case.punishment_type,
        punishment_duration_years=case.punishment_duration_years,
        punishment_start_date=case.punishment_start_date
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    for crim_id in case.criminal_ids:
        link = models.FIRCriminal(fir_id=db_case.fir_id, criminal_id=crim_id)
        db.add(link)
    db.commit()
    return get_case(db, db_case.fir_id)

def update_case(db: Session, fir_id: int, case_data: schemas.FIRUpdate):
    db_case = get_case(db, fir_id)
    if not db_case:
        raise HTTPException(status_code=404, detail="FIR not found")
    
    allowed_fields = [
        "case_status","crime_type","crime_date","crime_description",
        "verdict","punishment_type","punishment_duration_years","punishment_start_date"
    ]
    for field in allowed_fields:
        if hasattr(case_data, field) and getattr(case_data, field) is not None:
            setattr(db_case, field, getattr(case_data, field))
    
    db.commit()
    db.refresh(db_case)
    return db_case
