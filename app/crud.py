from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas
from datetime import date

# ---------------- USERS ----------------
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, password=user.password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # If police role → create officer entry
    if user.role == "police":
        officer = models.PoliceOfficer(
            user_id=db_user.user_id,
            name=user.name,
            rank_title=user.rank_title,
            station=user.station,
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

# ---------------- OFFICERS ----------------
def get_officer_by_user_id(db: Session, user_id: int):
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.user_id == user_id).first()
def get_officer_by_id(db: Session, officer_id: int):
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.officer_id == officer_id).first()

# ---------------- CRIMINALS ----------------
def get_criminals(db: Session):
    return db.query(models.Criminal).all()

def get_criminal(db: Session, criminal_id: int):
    return db.query(models.Criminal).filter(models.Criminal.criminal_id == criminal_id).first()

def create_criminal(db: Session, criminal: schemas.CriminalCreate):
    db_criminal = models.Criminal(
        name=criminal.name,
        age=criminal.age,
        gender=criminal.gender,
        address=criminal.address,
        status=criminal.status
    )
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

# ---------------- CASES / FIR ----------------
def get_cases(db: Session):
    return db.query(models.FIR).all()

def get_case(db: Session, fir_id: int):
    return db.query(models.FIR).filter(models.FIR.fir_id == fir_id).first()

def create_case(db: Session, case: schemas.FIRCreate, officer_id: int):
    db_case = models.FIR(
        officer_id=officer_id,
        fir_date=date.today(),
        case_status=case.case_status,
        crime_type=case.crime_type,
        crime_date=case.crime_date,
        crime_description=case.crime_description,
        verdict=case.verdict,
        punishment_type=case.punishment_type,
        punishment_duration_years=case.punishment_duration_years,
        punishment_start_date=case.punishment_start_date,
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    # Link criminals to the FIR
    if case.criminal_ids:
        for cid in case.criminal_ids:
            criminal = get_criminal(db, cid)
            if not criminal:
                raise HTTPException(status_code=404, detail=f"Criminal with id {cid} not found")
            link = models.FIRCriminal(fir_id=db_case.fir_id, criminal_id=cid)
            db.add(link)
        db.commit()

    db.refresh(db_case)
    return db_case

def update_case(db: Session, fir_id: int, case: schemas.FIRUpdate):
    db_case = get_case(db, fir_id)
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")

    for key, value in case.dict(exclude_unset=True).items():
        if key != "criminal_ids":
            setattr(db_case, key, value)

    db.commit()

    # Update linked criminals
    if case.criminal_ids is not None:
        # Clear existing links
        db.query(models.FIRCriminal).filter(models.FIRCriminal.fir_id == fir_id).delete()
        db.commit()

        for cid in case.criminal_ids:
            criminal = get_criminal(db, cid)
            if not criminal:
                raise HTTPException(status_code=404, detail=f"Criminal with id {cid} not found")
            link = models.FIRCriminal(fir_id=fir_id, criminal_id=cid)
            db.add(link)
        db.commit()

    db.refresh(db_case)
    return db_case
