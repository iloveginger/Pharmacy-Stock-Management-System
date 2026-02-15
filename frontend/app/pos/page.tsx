"use client";

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Trash2, Search, Receipt } from 'lucide-react';
import { fetchMedicines, createSale, Medicine } from '@/app/lib/api';

// Extended type for Cart Item (Medicine + quantity selected)
interface CartItem extends Medicine {
  cartQuantity: number;
}

export default function POSPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load medicines on mount
  useEffect(() => {
    fetchMedicines()
      .then(data => {
        setMedicines(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const addToCart = (med: Medicine) => {
    const existing = cart.find(item => item.id === med.id);
    if (existing) {
      // Check if we have enough stock
      if (existing.cartQuantity >= med.stock_quantity) {
        alert("Not enough stock!");
        return;
      }
      setCart(cart.map(item => item.id === med.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
    } else {
      setCart([...cart, { ...med, cartQuantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const saleData = {
        total_amount: calculateTotal(),
        items: cart.map(item => ({
          medicine_id: item.id,
          quantity: item.cartQuantity,
          price_at_sale: item.price
        }))
      };

      await createSale(saleData);
      
      alert("✅ Sale Recorded Successfully!");
      setCart([]); // Clear cart
      // Refresh stock data
      const updatedMeds = await fetchMedicines();
      setMedicines(updatedMeds);
      
    } catch (error) {
      console.error(error);
      alert("❌ Failed to record sale. Check console.");
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      {/* Left: Product List */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Billing Counter</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search medicine..." 
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-2 xl:grid-cols-3 gap-4 pr-2">
          {filteredMeds.map((med) => (
            <button 
              key={med.id}
              disabled={med.stock_quantity <= 0}
              onClick={() => addToCart(med)}
              className="p-4 border rounded-xl bg-white hover:border-blue-500 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-800">{med.brand_name}</span>
                <Plus size={18} className="text-blue-600 group-hover:scale-110 transition-transform"/>
              </div>
              <div className="flex justify-between items-end">
                <span className={`text-xs ${med.stock_quantity < 10 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                  Stock: {med.stock_quantity}
                </span>
                <span className="font-bold text-lg">Rs. {med.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="lg:col-span-4 bg-white border rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b bg-slate-50">
          <h2 className="font-bold flex items-center gap-2"><ShoppingCart size={20}/> Current Bill</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <Receipt size={48} className="mx-auto mb-2 opacity-20"/>
              <p>Empty Cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div>
                  <div className="font-medium">{item.brand_name}</div>
                  <div className="text-xs text-slate-500">Rs. {item.price} x {item.cartQuantity}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">Rs. {item.price * item.cartQuantity}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t space-y-4">
          <div className="flex justify-between text-2xl font-black text-slate-800">
            <span>Total</span>
            <span>Rs. {calculateTotal()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            Confirm Sale
          </button>
        </div>
      </div>
    </div>
  );
}