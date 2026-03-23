import sys
import os

# --- PATH FIX: Ensures Python finds the backend folder ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
# Import all our routes
from backend.routes import inventory_items, sales, dashboard, auth

# Create Database Tables (if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS: Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect Routes to App
app.include_router(inventory_items.router)
app.include_router(sales.router)
app.include_router(dashboard.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"status": "Pharmacy Backend Running"}