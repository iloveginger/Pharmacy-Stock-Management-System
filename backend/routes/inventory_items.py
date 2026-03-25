from fastapi import APIRouter, Depends, HTTPException, status # 👈 Added status here
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import models, schemas
from backend.utils.auth import get_current_user

router = APIRouter()

@router.get("/medicines", response_model=List[schemas.Medicine])
def get_all_medicines(db: Session = Depends(get_db)):
    return db.query(models.Medicine).all()

@router.post("/medicines", response_model=schemas.Medicine, status_code=status.HTTP_201_CREATED)
def add_medicine(
    medicine: schemas.MedicineCreate, 
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Only Admins can add stock."
        )
        
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

@router.put("/medicines/{medicine_id}")
def update_medicine(
    medicine_id: int, 
    medicine_data: schemas.MedicineCreate, 
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Only Admins can edit stock."
        )
    
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db_medicine.brand_name = medicine_data.brand_name
    db_medicine.generic_name = medicine_data.generic_name
    db_medicine.price = medicine_data.price
    db_medicine.stock_quantity = medicine_data.stock_quantity
    db_medicine.expiry_date = medicine_data.expiry_date
    
    db.commit()
    db.refresh(db_medicine)
    
    return db_medicine