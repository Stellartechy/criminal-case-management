from pydantic import BaseModel

# ---------------- Users ----------------
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserRead(UserBase):
    user_id: int

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2

# ---------------- Criminals ----------------
class CriminalBase(BaseModel):
    name: str
    age: int
    crime: str

class CriminalCreate(CriminalBase):
    pass

class CriminalRead(CriminalBase):
    id: int

    class Config:
        from_attributes = True

# ---------------- Cases ----------------
class CaseBase(BaseModel):
    title: str
    description: str
    court_id: int

class CaseCreate(CaseBase):
    pass

class CaseRead(CaseBase):
    id: int

    class Config:
        from_attributes = True

# ---------------- Court ----------------
class CourtBase(BaseModel):
    name: str
    location: str

class CourtCreate(CourtBase):
    pass

class CourtRead(CourtBase):
    id: int

    class Config:
        from_attributes = True
