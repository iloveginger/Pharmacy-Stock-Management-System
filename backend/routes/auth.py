from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from backend.database import get_db
from backend.models import models, schemas
from backend.utils.auth import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Profile)
def register_user(user: schemas.ProfileCreate, db: Session = Depends(get_db)):
    # 1. Check if username already exists
    existing_user = db.query(models.Profile).filter(models.Profile.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # 2. Hash the password
    hashed_password = get_password_hash(user.password)
    
    # 3. Save to database
    db_user = models.Profile(
        username=user.username, 
        email=user.email, 
        password=hashed_password, 
        role=user.role # 'Admin' or 'Staff'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Find the user
    user = db.query(models.Profile).filter(models.Profile.username == form_data.username).first()
    
    # 2. Verify password
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password"
        )
    
    # 3. Generate token
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role, 
        "username": user.username
    }