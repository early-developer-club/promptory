from sqlalchemy.orm import Session
import models
import schemas

def get_user_by_email(db: Session, email: str):
    """Fetch a single user by their email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_data: schemas.UserCreate):
    """
    Create a new user in the database.
    This is a generic user creation function.
    For OAuth, we might adapt this or use a similar one.
    """
    # In a real app with passwords, you'd hash the password here.
    # fake_hashed_password = user_data.password + "notreallyhashed"
    db_user = models.User(
        email=user_data.email,
        # hashed_password=fake_hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_or_create_user(db: Session, user_info: dict):
    """
    Get a user from the DB by email, or create them if they don't exist.
    This is specifically for the OAuth flow where we trust the user info from Google.
    """
    user = get_user_by_email(db, email=user_info['email'])
    if user:
        return user
    
    # User doesn't exist, create a new one.
    new_user = models.User(
        email=user_info['email'],
        provider="google",
        provider_id=user_info.get('sub') # Google's unique ID for the user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
