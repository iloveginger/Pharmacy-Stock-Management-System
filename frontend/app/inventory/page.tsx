"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, X, AlertCircle } from "lucide-react";

interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  price: number;
  stock_quantity: number;
  expiry_date: string;
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    brand_name: "",
    generic_name: "",
    price: "",
    stock_quantity: "",
    expiry_date: "",
  });

  // Load Data and Role
  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch("http://localhost:8000/medicines");
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/medicines/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to delete item");

      setMedicines(prev => prev.filter(med => med.id !== id));
      
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  // --- ADD / EDIT LOGIC ---
  const openModal = (med: Medicine | null = null) => {
    if (med) {
      setEditingMed(med);
      setFormData({
        brand_name: med.brand_name,
        generic_name: med.generic_name || "",
        price: med.price.toString(),
        stock_quantity: med.stock_quantity.toString(),
        expiry_date: med.expiry_date || "",
      });
    } else {
      setEditingMed(null);
      setFormData({ brand_name: "", generic_name: "", price: "", stock_quantity: "", expiry_date: "" });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingMed 
      ? `http://localhost:8000/medicines/${editingMed.id}` 
      : `http://localhost:8000/medicines`;
    
    const method = editingMed ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          brand_name: formData.brand_name,
          generic_name: formData.generic_name,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          expiry_date: formData.expiry_date || null
        })
      });

      if (!res.ok) throw new Error("Failed to save medicine");
      
      fetchMedicines(); // Refresh the list
      setIsModalOpen(false); // Close modal
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.brand_name.toLowerCase().includes(search.toLowerCase()) || 
    (m.generic_name && m.generic_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading Inventory...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4 pb-12">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your medicine stock and pricing</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by brand or generic..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Only Admins can add new stock */}
          {userRole === "Admin" && (
            <button 
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-md shadow-blue-200"
            >
              <Plus size={18} /> Add Medicine
            </button>
          )}
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="font-semibold p-5 uppercase tracking-wider text-xs">Medicine Details</th>
              <th className="font-semibold p-5 uppercase tracking-wider text-xs">Stock Level</th>
              <th className="font-semibold p-5 uppercase tracking-wider text-xs">Price</th>
              <th className="font-semibold p-5 uppercase tracking-wider text-xs">Expiry Date</th>
              {userRole === "Admin" && <th className="font-semibold p-5 text-right uppercase tracking-wider text-xs">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMeds.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No medicines found.</td></tr>
            ) : (
              filteredMeds.map((med) => (
                <tr key={med.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <td className="p-5">
                    <p className="font-bold text-slate-900">{med.brand_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{med.generic_name || "N/A"}</p>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${
                      med.stock_quantity <= 0 ? 'bg-red-50 text-red-600' :
                      med.stock_quantity < 10 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700'
                    }`}>
                      {med.stock_quantity <= 0 ? 'Out of Stock' : `${med.stock_quantity} in stock`}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-slate-900">
                    Rs. {med.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-5 text-sm text-slate-600">
                    {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString() : 'N/A'}
                  </td>
                  
                  {/* Actions (Admin Only) */}
                  {userRole === "Admin" && (
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(med)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(med.id, med.brand_name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingMed ? <Edit className="text-blue-600" size={20}/> : <Plus className="text-blue-600" size={20}/>}
                {editingMed ? "Edit Medicine" : "Add New Medicine"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Brand Name *</label>
                <input required type="text" value={formData.brand_name} onChange={e => setFormData({...formData, brand_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Generic Name</label>
                <input type="text" value={formData.generic_name} onChange={e => setFormData({...formData, generic_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price (Rs) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock Qty *</label>
                  <input required type="number" min="0" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-600" />
              </div>
              
              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
                  {editingMed ? "Save Changes" : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}