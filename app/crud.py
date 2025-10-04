# app/crud.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app import models, schemas

# ---------------- Users ----------------
def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user.username,
        password=user.password,  # TODO: hash in production
        role=user.role,
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    user = get_user_by_username(db, username)
    if user and user.password == password:
        return user
    return None

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_users_by_role(db: Session, role: str) -> List[models.User]:
    return db.query(models.User).filter(models.User.role == role).all()

def delete_user(db: Session, user_id: int) -> Optional[models.User]:
    user = get_user(db, user_id)
    if user:
        db.delete(user)
        db.commit()
        return user
    return None

def update_user(db: Session, user_id: int, user_update: schemas.UserCreate) -> Optional[models.User]:
    # If you want a dedicated UserUpdate schema, use it. For now we accept full UserCreate-like payload.
    user = get_user(db, user_id)
    if not user:
        return None
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

# ---------------- Police Officers ----------------
def get_officer_by_user_id(db: Session, user_id: int) -> Optional[models.PoliceOfficer]:
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.user_id == user_id).first()

def get_officer_by_id(db: Session, officer_id: int) -> Optional[models.PoliceOfficer]:
    return db.query(models.PoliceOfficer).filter(models.PoliceOfficer.officer_id == officer_id).first()

def create_officer(db: Session, officer: schemas.OfficerBase, user_id: int) -> models.PoliceOfficer:
    db_officer = models.PoliceOfficer(
        user_id=user_id,
        name=officer.name,
        rank_title=officer.rank_title,
        station=officer.station
    )
    db.add(db_officer)
    db.commit()
    db.refresh(db_officer)
    return db_officer

# ---------------- Criminals ----------------
def create_criminal(db: Session, criminal: schemas.CriminalCreate) -> models.Criminal:
    db_criminal = models.Criminal(**criminal.dict())
    db.add(db_criminal)
    db.commit()
    db.refresh(db_criminal)
    return db_criminal

def get_criminals(db: Session) -> List[models.Criminal]:
    return db.query(models.Criminal).all()

def get_criminal(db: Session, criminal_id: int) -> Optional[models.Criminal]:
    return db.query(models.Criminal).filter(models.Criminal.criminal_id == criminal_id).first()

def update_criminal(db: Session, criminal_id: int, criminal: schemas.CriminalUpdate) -> Optional[models.Criminal]:
    db_criminal = get_criminal(db, criminal_id)
    if db_criminal:
        for key, value in criminal.dict(exclude_unset=True).items():
            setattr(db_criminal, key, value)
        db.commit()
        db.refresh(db_criminal)
    return db_criminal

def delete_criminal(db: Session, criminal_id: int) -> Optional[models.Criminal]:
    db_criminal = get_criminal(db, criminal_id)
    if db_criminal:
        db.delete(db_criminal)
        db.commit()
        return db_criminal
    return None

# ---------------- Cases / FIRs ----------------
def create_case(db: Session, case: schemas.FIRCreate, officer_id: int) -> models.FIR:
    db_case = models.FIR(
        fir_date=case.fir_date,
        case_status=case.case_status or "Open",
        crime_type=case.crime_type,
        crime_date=case.crime_date,
        crime_description=case.crime_description,
        verdict=case.verdict or "Pending",
        punishment_type=case.punishment_type,
        punishment_duration_years=case.punishment_duration_years,
        punishment_start_date=case.punishment_start_date,
        officer_id=officer_id
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    # Link criminals via relationship (safe check for existence)
    for cid in case.criminal_ids:
        criminal = db.query(models.Criminal).filter(models.Criminal.criminal_id == cid).first()
        if criminal:
            db_case.criminals.append(criminal)
    db.commit()
    db.refresh(db_case)

    # add officer_name attribute for convenience (not persisted)
    db_case.officer_name = db_case.officer.name if db_case.officer else None
    return db_case

def get_cases(db: Session) -> List[models.FIR]:
    return db.query(models.FIR).all()

def get_case(db: Session, fir_id: int) -> Optional[models.FIR]:
    case = db.query(models.FIR).filter(models.FIR.fir_id == fir_id).first()
    if case:
        case.officer_name = case.officer.name if case.officer else None
    return case

def update_case(db: Session, fir_id: int, case_update: schemas.FIRUpdate) -> Optional[models.FIR]:
    db_case = db.query(models.FIR).filter(models.FIR.fir_id == fir_id).first()
    if not db_case:
        return None

    # update scalar fields (exclude criminal_ids because that requires special handling)
    for key, value in case_update.dict(exclude_unset=True, exclude={"criminal_ids"}).items():
        setattr(db_case, key, value)
    db.commit()

    # If criminal_ids provided, update associations
    if getattr(case_update, "criminal_ids", None) is not None:
        # clear existing associations
        db_case.criminals = []
        for cid in case_update.criminal_ids:
            criminal = db.query(models.Criminal).filter(models.Criminal.criminal_id == cid).first()
            if criminal:
                db_case.criminals.append(criminal)
        db.commit()

    db.refresh(db_case)
    db_case.officer_name = db_case.officer.name if db_case.officer else None
    return db_case

def delete_case(db: Session, fir_id: int) -> Optional[models.FIR]:
    db_case = db.query(models.FIR).filter(models.FIR.fir_id == fir_id).first()
    if db_case:
        db.delete(db_case)
        db.commit()
        return db_case
    return None
