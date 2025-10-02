# criminal-case-management/app/main.py

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse

from app import models, schemas, crud
from app.database import engine, Base, get_db
from app.routers import cases, court, criminals  # absolute imports
from app.crud import verify_password, get_user_by_username
# ------------------ Database ------------------
# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# ------------------ FastAPI app ------------------
app = FastAPI(title="Criminal Case Management")

# ------------------ CORS Middleware ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Include Routers ------------------
app.include_router(cases.router, prefix="/cases", tags=["cases"])
app.include_router(court.router, prefix="/court", tags=["court"])
app.include_router(criminals.router, prefix="/criminals", tags=["criminals"])

# ------------------ Root endpoint ------------------
@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head>
            <title>Criminal Case Management</title>
        </head>
        <body>
            <h1>Criminal Case Management Backend Running!</h1>
            <p>Visit <a href='/docs'>/docs</a> for Swagger UI.</p>
        </body>
    </html>
    """

# ------------------ LOGIN ------------------
@app.post("/login")
def login(user: schemas.UserBase, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if not db_user or not crud.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful", "role": db_user.role, "user_id": db_user.user_id}
# ------------------ USERS ------------------
@app.get("/users", response_model=list[schemas.UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.post("/users", response_model=schemas.UserRead)
def create_user(user: schemas.UserBase, db: Session = Depends(get_db)):
    return crud.create_user(db, user)
