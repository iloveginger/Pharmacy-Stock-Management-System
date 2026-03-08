"use client";

import { useEffect, useState } from "react";
import { 
  Pill, AlertTriangle, TrendingUp, PackageX, Clock, Receipt, Wallet 
} from "lucide-react";

interface RecentSale {
  id: number;
  total_amount: number;
  sale_date: string;
}

interface DashboardData {
  total_items: number;
  low_stock: number;
  out_of_stock: number;
  expiring_soon: number;
  today_sales: number;
  monthly_sales: number; // 👈 NEW
  recent_sales: RecentSale[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading Dashboard...</div>;
  if (!stats) return <div className="p-8 text-red-500">Error loading data. Is the backend running?</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Overview</h1>

      {/* --- STATS GRID --- 
          Changed to xl:grid-cols-5 to fit all 5 cards in a row on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* Today's Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
            <p className="text-xl font-bold text-slate-800">Rs. {stats.today_sales.toFixed(2)}</p>
          </div>
        </div>
        {/*Monthly revenue card*/}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-4 rounded-xl text-yellow-600">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
            <p className="text-xl font-bold">Rs. {stats.monthly_sales.toFixed(2)}</p>
          </div>
        </div>

        {/* Total Items Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <Pill size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Medicines</p>
            <p className="text-xl font-bold text-slate-800">{stats.total_items}</p>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Expiring &lt;30 Days</p>
            <p className="text-xl font-bold text-slate-800">{stats.expiring_soon}</p>
          </div>
        </div>

    
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-xl text-red-600">
            <PackageX size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Out of Stock</p>
            <p className="text-xl font-bold text-slate-800">{stats.out_of_stock}</p>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Recent Sales --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b flex items-center gap-2">
          <Receipt className="text-slate-500" size={20} />
          <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-medium">Receipt ID</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Total Amount</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_sales.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">No sales recorded yet.</td></tr>
            ) : (
              stats.recent_sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-medium text-blue-600">#INV-{sale.id.toString().padStart(4, '0')}</td>
                  <td className="p-4 text-slate-600">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-800">Rs. {sale.total_amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Completed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}