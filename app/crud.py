from sqlalchemy.orm import Session
from . import models, schemas

# Criminals
def get_criminals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Criminal).offset(skip).limit(limit).all()

def create_criminal(db: Session, criminal: schemas.CriminalCreate):
    db_obj = models.Criminal(**criminal.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Cases
def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Cases).offset(skip).limit(limit).all()

def create_case(db: Session, case: schemas.CaseCreate):
    db_obj = models.Cases(**case.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Court
def get_courts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Court).offset(skip).limit(limit).all()

def create_court(db: Session, court: schemas.CourtCreate):
    db_obj = models.Court(**court.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Users (simple read)
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()
