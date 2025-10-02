# app/hash_existing_passwords.py

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.crud import get_password_hash

def main():
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            # Truncate password to 72 chars (bcrypt limit)
            plain = user.password[:72]
            user.password = get_password_hash(plain)
            print(f"Hashed password for user: {user.username}")
        db.commit()
        print("All passwords hashed successfully!")
    except Exception as e:
        db.rollback()
        print("Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    main()
