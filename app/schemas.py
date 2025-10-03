from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# ---------------- Users ----------------
class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    # Officer info (only for police)
    name: Optional[str] = None
    rank_title: Optional[str] = None
    station: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class UserRead(BaseModel):
    user_id: int
    username: str
    role: str
    class Config:
        orm_mode = True

# ---------------- Officers ----------------
class OfficerRead(BaseModel):
    officer_id: int
    user_id: int
    name: str
    rank_title: str
    station: str
    class Config:
        orm_mode = True

# ---------------- Criminals ----------------
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
    class Config:
        orm_mode = True

# ---------------- FIR / Cases ----------------
class FIRBase(BaseModel):
    case_status: Optional[str]
    crime_type: Optional[str]
    crime_date: Optional[date]
    crime_description: Optional[str]
    verdict: Optional[str]
    punishment_type: Optional[str]
    punishment_duration_years: Optional[int]
    punishment_start_date: Optional[date]

class FIRCreate(FIRBase):
    criminal_ids: List[int]

class FIRUpdate(FIRBase):
    pass

class FIRRead(FIRBase):
    fir_id: int
    officer_id: Optional[int]
    officer_name: Optional[str]
    fir_date: Optional[date]
    criminals: List[CriminalRead] = []
    class Config:
        orm_mode = True
