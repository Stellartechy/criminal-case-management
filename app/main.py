from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import os

# ----------------- CONFIG -----------------
DB_USER = "root"
DB_PASSWORD = "Salih%402003"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "criminal_management"

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# ----------------- DATABASE SETUP -----------------
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ----------------- MODELS -----------------
class Criminal(Base):
    __tablename__ = "criminals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    age = Column(Integer)
    gender = Column(String(50))
    address = Column(String(255))
    crimes = relationship("Case", back_populates="criminal")


class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_title = Column(String(255))
    description = Column(String(500))
    date_reported = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="Registered")
    criminal_id = Column(Integer, ForeignKey("criminals.id"))

    criminal = relationship("Criminal", back_populates="crimes")


Base.metadata.create_all(bind=engine)

# ----------------- APP SETUP -----------------
app = FastAPI()

# ----------------- CORS SETUP -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # frontend address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- ROUTES -----------------
@app.get("/")
def root():
    return {"message": "Criminal Case Management API is running"}


@app.get("/cases")
def get_cases():
    db = SessionLocal()
    try:
        cases = db.query(Case).all()
        return cases
    finally:
        db.close()


@app.post("/cases")
def create_case(case: dict):
    db = SessionLocal()
    try:
        new_case = Case(
            case_title=case.get("case_title"),
            description=case.get("description"),
            status=case.get("status", "Registered"),
            criminal_id=case.get("criminal_id")
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        return new_case
    finally:
        db.close()


@app.get("/criminals")
def get_criminals():
    db = SessionLocal()
    try:
        criminals = db.query(Criminal).all()
        return criminals
    finally:
        db.close()


@app.post("/criminals")
def create_criminal(criminal: dict):
    db = SessionLocal()
    try:
        new_criminal = Criminal(
            name=criminal.get("name"),
            age=criminal.get("age"),
            gender=criminal.get("gender"),
            address=criminal.get("address"),
        )
        db.add(new_criminal)
        db.commit()
        db.refresh(new_criminal)
        return new_criminal
    finally:
        db.close()
