from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app import models, schemas, crud
from app.database import engine, Base, get_db
from app.router import cases, court, criminals

# Create database tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="Criminal Case Management")

# CORS setup (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In production, restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ ROOT ------------------
@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head>
            <title>Backend Running</title>
        </head>
        <body>
            <h1>Criminal Case Management Backend is running!</h1>
            <p>Visit /docs for API documentation.</p>
        </body>
    </html>
    """

# ------------------ ROUTERS ------------------
app.include_router(cases.router, prefix="/cases")
app.include_router(court.router, prefix="/court")
app.include_router(criminals.router, prefix="/criminals")

# ------------------ LOGIN ENDPOINT ------------------
@app.post("/login")
def login(user: schemas.UserBase, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful", "role": db_user.role, "user_id": db_user.user_id}

# ------------------ USERS ENDPOINTS ------------------
@app.get("/users", response_model=list[schemas.UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.post("/users", response_model=schemas.UserRead)
def create_user(user: schemas.UserBase, db: Session = Depends(get_db)):
    return crud.create_user(db, user)
