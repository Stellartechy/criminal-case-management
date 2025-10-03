from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

# ---------------- Users ----------------
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("admin", "police", name="user_roles", native_enum=False), nullable=False)
    officer = relationship("PoliceOfficer", back_populates="user", uselist=False)

# ---------------- Police Officers ----------------
class PoliceOfficer(Base):
    __tablename__ = "police_officer"
    officer_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True)
    name = Column(String(100), nullable=False)
    rank_title = Column(String(50))
    station = Column(String(100))
    user = relationship("User", back_populates="officer")
    firs = relationship("FIR", back_populates="officer")

# ---------------- Criminals ----------------
class Criminal(Base):
    __tablename__ = "criminal"
    criminal_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(Enum("Male", "Female", "Other", name="gender_enum", native_enum=False))
    address = Column(String(255))
    status = Column(Enum("Under Trial", "Released", "Convicted", name="status_enum", native_enum=False), default="Under Trial")
    firs = relationship("FIR", secondary="fir_criminal", back_populates="criminals")

# ---------------- FIR / Cases ----------------
class FIR(Base):
    __tablename__ = "fir"
    fir_id = Column(Integer, primary_key=True, index=True)
    officer_id = Column(Integer, ForeignKey("police_officer.officer_id"))
    fir_date = Column(Date)
    case_status = Column(Enum("Open","In Court","Closed", name="case_status_enum", native_enum=False), default="Open")
    crime_type = Column(String(100))
    crime_date = Column(Date)
    crime_description = Column(Text)
    verdict = Column(Enum("Pending","Guilty","Not Guilty", name="verdict_enum", native_enum=False), default="Pending")
    punishment_type = Column(String(100))
    punishment_duration_years = Column(Integer)
    punishment_start_date = Column(Date)
    officer = relationship("PoliceOfficer", back_populates="firs")
    criminals = relationship("Criminal", secondary="fir_criminal", back_populates="firs")

# ---------------- FIR-CRIMINAL LINK ----------------
class FIRCriminal(Base):
    __tablename__ = "fir_criminal"
    fir_id = Column(Integer, ForeignKey("fir.fir_id"), primary_key=True)
    criminal_id = Column(Integer, ForeignKey("criminal.criminal_id"), primary_key=True)
