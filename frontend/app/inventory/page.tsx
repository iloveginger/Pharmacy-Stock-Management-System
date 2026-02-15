"use client";

import { useEffect, useState } from 'react';
import { Search, AlertCircle, RefreshCw, Plus, X, Save } from 'lucide-react';
import { fetchMedicines, Medicine } from '@/app/lib/api';

// Define the shape of our form data (no ID needed for creation)
interface NewMedicine {
  brand_name: string;
  generic_name: string;
  stock_quantity: number;
  price: number;
  expiry_date: string;
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewMedicine>({
    brand_name: "", generic_name: "", stock_quantity: 0, price: 0, expiry_date: ""
  });

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMedicines();
      setMedicines(data);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Handle Form Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock_quantity' || name === 'price' ? parseFloat(value) : value
    }));
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add medicine");

      alert("✅ Medicine Added Successfully!");
      setIsModalOpen(false);      // Close Modal
      setFormData({ brand_name: "", generic_name: "", stock_quantity: 0, price: 0, expiry_date: "" }); // Reset Form
      loadData();                 // Refresh Table

    } catch (error) {
      console.error(error);
      alert("❌ Error adding medicine. Check backend console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search stock..." 
              className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={loadData} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Add New
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-600 text-sm uppercase">
            <tr>
              <th className="p-4 font-semibold">Brand Name</th>
              <th className="p-4 font-semibold">Generic Name</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Price (NPR)</th>
              <th className="p-4 font-semibold">Expiry</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading Inventory...</td></tr>
            ) : filteredMeds.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">No medicines found.</td></tr>
            ) : (
              filteredMeds.map((med) => (
                <tr key={med.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{med.brand_name}</td>
                  <td className="p-4 text-slate-500 text-sm">{med.generic_name || "-"}</td>
                  <td className="p-4 font-mono">{med.stock_quantity}</td>
                  <td className="p-4 font-mono">Rs. {med.price}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(med.expiry_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    {med.stock_quantity < 10 ? (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit font-bold text-xs uppercase">
                        <AlertCircle size={14}/> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit font-bold text-xs uppercase">In Stock</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD MEDICINE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">Add New Medicine</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                  <input required name="brand_name" value={formData.brand_name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Nims" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Generic Name</label>
                  <input required name="generic_name" value={formData.generic_name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Nimesulide" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                  <input required type="number" name="stock_quantity" value={formData.stock_quantity || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (NPR)</label>
                  <input required type="number" step="0.01" name="price" value={formData.price || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input required type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
                {isSubmitting ? "Saving..." : "Save Medicine"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}