from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from backend.database import get_db
from backend.models import models, schemas

router = APIRouter()

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_items = db.query(models.Medicine).count()
    low_stock = db.query(models.Medicine).filter(models.Medicine.stock_quantity < 10).count()
    today_sales = db.query(func.sum(models.Sale.total_amount))\
        .filter(models.Sale.sale_date == date.today()).scalar() or 0.0

    return {
        "total_items": total_items,
        "low_stock": low_stock,
        "today_sales": today_sales
    }