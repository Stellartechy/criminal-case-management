from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud
from ..database import get_db

router = APIRouter(tags=["cases"])

@router.get("/", response_model=List[schemas.CaseRead])
def read_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_cases(db, skip, limit)

@router.post("/", response_model=schemas.CaseRead)
def add_case(payload: schemas.CaseCreate, db: Session = Depends(get_db)):
    return crud.create_case(db, payload)
