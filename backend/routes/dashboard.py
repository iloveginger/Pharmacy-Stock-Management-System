from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta
from backend.database import get_db
from backend.models import models, schemas

router = APIRouter()

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    thirty_days_from_now = today + timedelta(days=30)
    
    # Get the 1st day of the current month
    first_day_of_month = today.replace(day=1)

    # Calculate metrics
    total_items = db.query(models.Medicine).count()
    low_stock = db.query(models.Medicine).filter(models.Medicine.stock_quantity > 0, models.Medicine.stock_quantity <= 10).count()
    out_of_stock = db.query(models.Medicine).filter(models.Medicine.stock_quantity == 0).count()
    expiring_soon = db.query(models.Medicine).filter(models.Medicine.expiry_date <= thirty_days_from_now).count()

    # Today's Revenue
    today_sales = db.query(func.sum(models.Sale.total_amount))\
        .filter(models.Sale.sale_date == today).scalar() or 0.0
        
    #Montly Revenue
    monthly_sales = db.query(func.sum(models.Sale.total_amount))\
        .filter(models.Sale.sale_date >= first_day_of_month).scalar() or 0.0

    recent_sales = db.query(models.Sale).order_by(desc(models.Sale.id)).limit(5).all()

    return {
        "total_items": total_items,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "expiring_soon": expiring_soon,
        "today_sales": today_sales,
        "monthly_sales": monthly_sales, 
        "recent_sales": recent_sales
    }