from sqlalchemy import Column, Integer, String, Enum, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(Enum("admin","police","court"), nullable=False)

class PoliceOfficer(Base):
    __tablename__ = "police_officer"
    officer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rank_title = Column(String(50))
    station = Column(String(100))

    cases = relationship("Case", back_populates="officer")

class Criminal(Base):
    __tablename__ = "criminal"
    criminal_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    address = Column(String(255))
    status = Column(Enum("Under Trial","Released","Convicted"), default="Under Trial")

    crimes = relationship("Crime", back_populates="criminal")
    cases = relationship("Case", back_populates="criminal")

class Crime(Base):
    __tablename__ = "crime"
    crime_id = Column(Integer, primary_key=True, index=True)
    criminal_id = Column(Integer, ForeignKey("criminal.criminal_id"))
    crime_type = Column(String(100))
    crime_date = Column(Date)
    description = Column(String(255))

    criminal = relationship("Criminal", back_populates="crimes")

class Case(Base):
    __tablename__ = "case"
    case_id = Column(Integer, primary_key=True, index=True)
    criminal_id = Column(Integer, ForeignKey("criminal.criminal_id"))
    officer_id = Column(Integer, ForeignKey("police_officer.officer_id"), nullable=True)
    case_status = Column(Enum("Open","In Court","Closed"), default="Open")
    case_date = Column(Date, default=datetime.date.today)

    criminal = relationship("Criminal", back_populates="cases")
    officer = relationship("PoliceOfficer", back_populates="cases")
    court = relationship("Court", back_populates="case", uselist=False)

class Court(Base):
    __tablename__ = "court"
    court_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case.case_id"))
    hearing_date = Column(Date)
    verdict = Column(Enum("Guilty","Not Guilty","Pending"), default="Pending")

    case = relationship("Case", back_populates="court")
    punishment = relationship("Punishment", back_populates="court", uselist=False)

class Punishment(Base):
    __tablename__ = "punishment"
    punishment_id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("court.court_id"))
    punishment_type = Column(String(100))
    duration = Column(String(50))
    start_date = Column(Date)

    court = relationship("Court", back_populates="punishment")
