from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db

router = APIRouter(tags=["court"])

@router.get("/", response_model=List[schemas.CourtRead])
def read_courts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_courts(db, skip, limit)

@router.post("/", response_model=schemas.CourtRead)
def add_court(payload: schemas.CourtCreate, db: Session = Depends(get_db)):
    return crud.create_court(db, payload)
