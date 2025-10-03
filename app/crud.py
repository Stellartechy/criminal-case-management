from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- Users ----------------
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username==username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(username=user.username, password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not pwd_context.verify(password, user.password):
        return None
    return user

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
    for key, value in criminal.dict(exclude_unset=True).items():
        setattr(db_criminal, key, value)
    db.commit()
    db.refresh(db_criminal)
    return db_criminal

def delete_criminal(db: Session, criminal_id: int):
    db_criminal = get_criminal(db, criminal_id)
    db.delete(db_criminal)
    db.commit()

# ---------------- FIR / Cases ----------------
def get_cases(db: Session):
    return db.query(models.FIR).options(joinedload(models.FIR.criminals)).all()

def get_case(db: Session, fir_id: int):
    return db.query(models.FIR).options(joinedload(models.FIR.criminals)).filter(models.FIR.fir_id==fir_id).first()

def create_case(db: Session, case: schemas.FIRCreate, officer_id: int):
    db_case = models.FIR(
        officer_id=officer_id,
        fir_date=case.fir_date,
        case_status=case.case_status,
        crime_type=case.crime_type,
        crime_date=case.crime_date,
        crime_description=case.crime_description
    )
    # Link criminals
    db_case.criminals = db.query(models.Criminal).filter(models.Criminal.criminal_id.in_(case.criminal_ids)).all()
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

def update_case(db: Session, fir_id: int, case: schemas.FIRUpdate):
    db_case = get_case(db, fir_id)
    for key, value in case.dict(exclude_unset=True).items():
        setattr(db_case, key, value)
    db.commit()
    db.refresh(db_case)
    return db_case

def delete_case(db: Session, fir_id: int):
    db_case = get_case(db, fir_id)
    db.delete(db_case)
    db.commit()
