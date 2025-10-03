from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Many-to-many association between FIR and Criminal
fir_criminal_table = Table(
    "fir_criminal",
    Base.metadata,
    Column("fir_id", Integer, ForeignKey("fir.fir_id", ondelete="CASCADE"), primary_key=True),
    Column("criminal_id", Integer, ForeignKey("criminal.criminal_id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("admin", "police", name="user_roles"), nullable=False)

class PoliceOfficer(Base):
    __tablename__ = "police_officer"
    officer_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)
    name = Column(String(100), nullable=False)
    rank_title = Column(String(50))
    station = Column(String(100))

class Criminal(Base):
    __tablename__ = "criminal"
    criminal_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(Enum("Male", "Female", "Other", name="gender_enum"))
    address = Column(String(255))
    status = Column(Enum("Under Trial", "Released", "Convicted", name="status_enum"), default="Under Trial")
    
    firs = relationship("FIR", secondary=fir_criminal_table, back_populates="criminals")

class FIR(Base):
    __tablename__ = "fir"
    fir_id = Column(Integer, primary_key=True, index=True)
    officer_id = Column(Integer, ForeignKey("police_officer.officer_id", ondelete="SET NULL"))
    fir_date = Column(Date, nullable=False)
    case_status = Column(Enum("Open", "In Court", "Closed", name="case_status_enum"), default="Open")
    crime_type = Column(String(100))
    crime_date = Column(Date)
    crime_description = Column(Text)
    verdict = Column(Enum("Pending", "Guilty", "Not Guilty", name="verdict_enum"), default="Pending")
    punishment_type = Column(String(100))
    punishment_duration_years = Column(Integer)
    punishment_start_date = Column(Date)
    
    criminals = relationship("Criminal", secondary=fir_criminal_table, back_populates="firs")
