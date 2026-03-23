from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import models, schemas
from backend.utils.auth import get_current_user

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

@router.delete("/medicines/{medicine_id}")
def delete_medicine(
    medicine_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(get_current_user) 
):

    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Only Admins can delete stock."
        )
    
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    

    db.delete(medicine)
    db.commit()
    
    return {"message": "Medicine deleted successfully"}