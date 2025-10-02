from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db

router = APIRouter(tags=["criminals"])

@router.get("/", response_model=List[schemas.CriminalRead])
def read_criminals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_criminals(db, skip, limit)

@router.post("/", response_model=schemas.CriminalRead)
def add_criminal(payload: schemas.CriminalCreate, db: Session = Depends(get_db)):
    return crud.create_criminal(db, payload)
