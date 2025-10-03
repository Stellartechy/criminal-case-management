from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# ---------------- USERS ----------------
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str
    # officer fields for signup (only if role == police)
    name: Optional[str] = None
    rank_title: Optional[str] = None
    station: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class UserRead(UserBase):
    user_id: int

    class Config:
        orm_mode = True

# ---------------- OFFICERS ----------------
class OfficerRead(BaseModel):
    officer_id: int
    user_id: int
    name: str
    rank_title: Optional[str]
    station: Optional[str]

    class Config:
        orm_mode = True

# ---------------- CRIMINALS ----------------
class CriminalBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = "Under Trial"

class CriminalCreate(CriminalBase):
    pass

class CriminalUpdate(BaseModel):
    name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    address: Optional[str]
    status: Optional[str]

# Show crimes associated with a criminal
class CriminalFIRInfo(BaseModel):
    fir_id: int
    crime_type: str
    case_status: str

    class Config:
        orm_mode = True

class CriminalRead(CriminalBase):
    criminal_id: int
    firs: List[CriminalFIRInfo] = []  # shows crimes for this criminal

    class Config:
        orm_mode = True

# ---------------- FIR / CASES ----------------
class FIRBase(BaseModel):
    case_status: Optional[str] = "Open"
    crime_type: str
    crime_date: date
    crime_description: str
    verdict: Optional[str] = "Pending"
    punishment_type: Optional[str] = None
    punishment_duration_years: Optional[int] = None
    punishment_start_date: Optional[date] = None

class FIRCreate(FIRBase):
    criminal_ids: List[int] = []   # allow linking criminals on creation

class FIRUpdate(FIRBase):
    criminal_ids: Optional[List[int]] = None  # can update linked criminals

# Show criminal info inside FIR
class FIRCriminalInfo(BaseModel):
    criminal_id: int
    name: str

    class Config:
        orm_mode = True

# Show officer inside FIR
class FIROfficerInfo(BaseModel):
    officer_id: int
    name: str
    rank_title: Optional[str]
    station: Optional[str]

    class Config:
        orm_mode = True

class FIRRead(FIRBase):
    fir_id: int
    fir_date: date
    officer: Optional[FIROfficerInfo]
    criminals: List[FIRCriminalInfo] = []  # show criminals linked

    class Config:
        orm_mode = True
