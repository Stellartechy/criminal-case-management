from pydantic import BaseModel
from typing import Optional
from datetime import date

# ------------------ Users ------------------
class UserBase(BaseModel):
    username: str
    password: str
    role: str

class UserRead(UserBase):
    user_id: int
    class Config:
        orm_mode = True

# ------------------ PoliceOfficer ------------------
class PoliceOfficerBase(BaseModel):
    name: str
    rank_title: Optional[str] = None
    station: Optional[str] = None

class PoliceOfficerRead(PoliceOfficerBase):
    officer_id: int
    class Config:
        orm_mode = True

# ------------------ Criminal ------------------
class CriminalBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None

class CriminalCreate(CriminalBase):
    pass

class CriminalRead(CriminalBase):
    criminal_id: int
    class Config:
        orm_mode = True

# ------------------ Case ------------------
class CaseBase(BaseModel):
    criminal_id: int
    officer_id: Optional[int] = None
    case_status: Optional[str] = None
    case_date: Optional[date] = None

class CaseCreate(CaseBase):
    pass

class CaseRead(CaseBase):
    case_id: int
    class Config:
        orm_mode = True

# ------------------ Court ------------------
class CourtBase(BaseModel):
    case_id: int
    hearing_date: Optional[date] = None
    verdict: Optional[str] = None

class CourtCreate(CourtBase):
    pass

class CourtRead(CourtBase):
    court_id: int
    class Config:
        orm_mode = True

