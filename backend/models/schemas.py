from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- MEDICINE SCHEMAS ---
class MedicineBase(BaseModel):
    brand_name: str
    generic_name: Optional[str] = None
    stock_quantity: int
    price: float
    expiry_date: date

class MedicineCreate(MedicineBase):
    pass

class Medicine(MedicineBase):
    id: int
    class Config:
        from_attributes = True

# --- SALE SCHEMAS ---
class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: int
    price_at_sale: float

class SaleCreate(BaseModel):
    total_amount: float
    items: List[SaleItemCreate] 

# --- DASHBOARD SCHEMAS ---
class DashboardStats(BaseModel):
    total_items: int
    low_stock: int
    today_sales: float

class RecentSale(BaseModel):
    id: int
    total_amount: float
    sale_date: date

class DashboardStats(BaseModel):
    total_items: int
    low_stock: int
    out_of_stock: int      
    expiring_soon: int     
    today_sales: float
    monthly_sales: float
    recent_sales: List[RecentSale] 

# --- PROFILE SCHEMAS ---
class ProfileBase(BaseModel):
    username: str
    email: str
    role: str

class ProfileCreate(ProfileBase):
    password: str

class Profile(ProfileBase):
    id: int
    class Config:
        from_attributes = True