from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
# Import directly from the files we just created
from backend.models import models, schemas

router = APIRouter()

@router.get("/medicines", response_model=List[schemas.Medicine])
def get_all_medicines(db: Session = Depends(get_db)):
    return db.query(models.Medicine).all()

@router.post("/add", response_model=schemas.Medicine)
def add_medicine(medicine: schemas.MedicineCreate, db: Session = Depends(get_db)):
    db_medicine = models.Medicine(**medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine