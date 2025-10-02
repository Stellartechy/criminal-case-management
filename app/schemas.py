from pydantic import BaseModel
from typing import Optional, List
import datetime

# ---------------- Users ----------------
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class UserRead(UserBase):
    user_id: int
    class Config:
        orm_mode = True

# ---------------- Police Officer ----------------
class PoliceOfficerBase(BaseModel):
    name: str
    rank_title: Optional[str] = None
    station: Optional[str] = None

class PoliceOfficerCreate(PoliceOfficerBase):
    pass

class PoliceOfficerRead(PoliceOfficerBase):
    officer_id: int
    class Config:
        orm_mode = True

# ---------------- Criminal ----------------
class CriminalBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = "Under Trial"

class CriminalCreate(CriminalBase):
    pass

class CriminalRead(CriminalBase):
    criminal_id: int
    class Config:
        orm_mode = True

# ---------------- Case ----------------
# ---------------- Case ----------------
class CaseBase(BaseModel):
    criminal_id: Optional[int] = None  # Make optional
    new_criminal_name: Optional[str] = None  # NEW: for creating new criminal
    officer_id: Optional[int] = None
    case_status: Optional[str] = "Open"
    case_date: Optional[datetime.date] = None

class CaseCreate(CaseBase):
    pass

class CaseRead(CaseBase):
    case_id: int
    criminal: Optional[CriminalRead] = None
    officer: Optional[PoliceOfficerRead] = None

    class Config:
        orm_mode = True



# ---------------- Court ----------------
class CourtBase(BaseModel):
    case_id: int
    hearing_date: Optional[datetime.date] = None
    verdict: Optional[str] = "Pending"

class CourtCreate(CourtBase):
    pass

class CourtRead(CourtBase):
    court_id: int
    class Config:
        orm_mode = True
