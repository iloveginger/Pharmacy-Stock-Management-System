// app/lib/api.ts

const API_BASE_URL = "http://localhost:8000"; // Ensure your FastAPI is running on this port

// --- TYPES (Match your FastAPI Pydantic Models) ---
export interface Medicine {
  id: number;
  brand_name: string; // Using brand_name as per your DB schema
  generic_name?: string;
  stock_quantity: number;
  price: number;
  expiry_date: string;
}

export interface SaleItem {
  medicine_id: number;
  quantity: number;
  price_at_sale: number;
}

export interface SaleCreate {
  total_amount: number;
  items: SaleItem[];
}

export interface DashboardStats {
  total_items: number;
  low_stock: number;
  today_sales: number;
}

// --- API FUNCTIONS ---

export async function fetchMedicines(): Promise<Medicine[]> {
  const res = await fetch(`${API_BASE_URL}/medicines`);
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

export async function createSale(data: SaleCreate) {
  const res = await fetch(`${API_BASE_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to record sale");
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // You'll need a specific endpoint for this, or calculate it from other data
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`); 
  if (!res.ok) return { total_items: 0, low_stock: 0, today_sales: 0 };
  return res.json();
}