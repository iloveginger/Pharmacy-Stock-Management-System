"use client";
import { useEffect, useState } from 'react';
import { fetchDashboardStats, DashboardStats } from '@/app/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total_items: 0, low_stock: 0, today_sales: 0 });

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Pharmacy Overview</h1>
        <p className="text-slate-500">Stock Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Items</p>
          <p className="text-3xl font-bold mt-2 text-slate-900">{stats.total_items}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase">Today's Revenue</p>
          <p className="text-3xl font-bold mt-2 text-green-600">Rs. {stats.today_sales}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm bg-red-50">
          <p className="text-sm font-medium text-red-600 uppercase">Low Stock Alerts</p>
          <p className="text-3xl font-bold mt-2 text-red-700">{stats.low_stock}</p>
        </div>
      </div>
    </div>
  );
}