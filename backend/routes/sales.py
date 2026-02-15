from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from backend.database import get_db
from backend.models import models, schemas

router = APIRouter()

@router.post("/sales", status_code=201)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    # 1. Create Sale Record
    new_sale = models.Sale(total_amount=sale.total_amount, sale_date=date.today())
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    # 2. Add Items & Decrease Stock
    for item in sale.items:
        db_item = models.SaleItem(
            sale_id=new_sale.id,
            medicine_id=item.medicine_id,
            quantity=item.quantity,
            price_at_sale=item.price_at_sale
        )
        db.add(db_item)
        
        # Deduct Stock
        medicine = db.query(models.Medicine).filter(models.Medicine.id == item.medicine_id).first()
        if medicine:
            if medicine.stock_quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {medicine.brand_name}")
            medicine.stock_quantity -= item.quantity

    db.commit()
    return {"message": "Sale successful"}