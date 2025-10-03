from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# ---------------- Criminal ----------------
class CriminalBase(BaseModel):
    name: str
    age: Optional[int]
    gender: Optional[str]
    address: Optional[str]
    status: Optional[str] = "Under Trial"

class CriminalCreate(CriminalBase):
    pass

class CriminalUpdate(CriminalBase):
    pass

class CriminalRead(CriminalBase):
    criminal_id: int
    firs: Optional[List['FIRShort']] = []

    class Config:
        orm_mode = True

# ---------------- FIR ----------------
class FIRBase(BaseModel):
    fir_date: Optional[date]
    case_status: Optional[str] = "Open"
    crime_type: str
    crime_date: date
    crime_description: str
    verdict: Optional[str] = "Pending"
    punishment_type: Optional[str]
    punishment_duration_years: Optional[int]
    punishment_start_date: Optional[date]

class FIRCreate(FIRBase):
    criminal_ids: List[int] = []

class FIRUpdate(FIRBase):
    criminal_ids: Optional[List[int]] = None

class FIRShort(FIRBase):
    fir_id: int

    class Config:
        orm_mode = True

class FIRRead(FIRBase):
    fir_id: int
    officer_id: int
    officer_name: Optional[str]
    criminals: Optional[List[CriminalRead]] = []

    class Config:
        orm_mode = True

# ---------------- User ----------------
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
class OfficerBase(BaseModel):
    name: str
    rank_title: Optional[str]
    station: Optional[str]

class OfficerRead(OfficerBase):
    officer_id: int
    user_id: int

    class Config:
        orm_mode = True
