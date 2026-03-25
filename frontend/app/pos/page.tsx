"use client";

import { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2, Receipt, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types ---
interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  stock_quantity: number;
  price: number;
}

interface CartItem extends Medicine {
  cartQuantity: number;
}

export default function POSPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  

  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [taxPercent, setTaxPercent] = useState<number>(13); 

  useEffect(() => {
    fetch("http://localhost:8000/medicines")
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(err => console.error(err));
  }, []);

 
  const addToCart = (med: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        if (existing.cartQuantity >= med.stock_quantity) return prev;
        return prev.map(item => item.id === med.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...med, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty > 0 && newQty <= item.stock_quantity) {
          return { ...item, cartQuantity: newQty };
        }
      }
      return item;
    }));
  };

  // --- Calculations ---
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxAmount = (subtotal - discountAmount) * (taxPercent / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  // --- PDF Generation ---
  const generatePDF = (saleId: number) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Pharmacy Stock Management System", 14, 22);
    doc.setFontSize(10);
    doc.text("Kathmandu, Nepal | 9800000000 ", 14, 30);
    
    // Invoice Details
    doc.setFontSize(12);
    doc.text(`Invoice #: INV-${saleId.toString().padStart(4, '0')}`, 14, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 52);

    // Table Data
    const tableColumn = ["Medicine", "Qty", "Unit Price (Rs)", "Total (Rs)"];
    const tableRows = cart.map(item => [
      item.brand_name,
      item.cartQuantity,
      item.price.toFixed(2),
      (item.price * item.cartQuantity).toFixed(2)
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138] }, // Blue-900
    });
// --- Totals at the bottom ---
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    
    const rightMargin = 196; 
    const labelX = 160; 

  
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    
    // Subtotal
    doc.text("Subtotal:", labelX, finalY + 10, { align: "right" });
    doc.setTextColor(15, 23, 42); 
    doc.text(`Rs. ${subtotal.toFixed(2)}`, rightMargin, finalY + 10, { align: "right" });
    
    // Discount
    doc.setTextColor(100, 116, 139);
    doc.text(`Discount (${discountPercent}%):`, labelX, finalY + 18, { align: "right" });
    doc.setTextColor(220, 38, 38); 
    doc.text(`- Rs. ${discountAmount.toFixed(2)}`, rightMargin, finalY + 18, { align: "right" });
    
    // Tax
    doc.setTextColor(100, 116, 139);
    doc.text(`Tax (${taxPercent}%):`, labelX, finalY + 26, { align: "right" });
    doc.setTextColor(15, 23, 42);
    doc.text(`+ Rs. ${taxAmount.toFixed(2)}`, rightMargin, finalY + 26, { align: "right" });
    
    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(120, finalY + 32, rightMargin, finalY + 32);
    
    // Grand Total
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    
    doc.text("Grand Total:", labelX, finalY + 40, { align: "right" });
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightMargin, finalY + 40, { align: "right" });
    
  
    doc.setFont("helvetica", "normal");
    // Save PDF
    doc.save(`Invoice_${saleId}.pdf`);
  };

  // --- Checkout ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    const saleData = {
      total_amount: grandTotal, 
      items: cart.map(item => ({
        medicine_id: item.id,
        quantity: item.cartQuantity,
        price_at_sale: item.price
      }))
    };

    try {
      const res = await fetch("http://localhost:8000/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData)
      });

      if (!res.ok) throw new Error("Sale failed");
      
      
      const mockSaleId = Math.floor(Math.random() * 1000); 
      
      generatePDF(mockSaleId); // 👈 Generate the PDF!
      
      alert("Sale Recorded & Invoice Generated");
      setCart([]); // Clear cart
      

      const freshMeds = await fetch("http://localhost:8000/medicines").then(res => res.json());
      setMedicines(freshMeds);
      
    } catch (err) {
      alert("Error processing sale");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex gap-6 pt-4 pb-8">
      
   
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search medicine..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 xl:grid-cols-3 gap-4 content-start">
          {filteredMeds.map((med) => (
            <button 
              key={med.id}
              disabled={med.stock_quantity <= 0}
              onClick={() => addToCart(med)}
              className="group text-left p-4 border border-slate-200 rounded-2xl hover:border-blue-300 hover:ring-4 hover:ring-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between h-32"
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-slate-800 truncate pr-2">{med.brand_name}</div>
                <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <Plus size={16} />
                </div>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className={`text-[11px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                  med.stock_quantity <= 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {med.stock_quantity <= 0 ? 'Empty' : `${med.stock_quantity} Left`}
                </span>
                <span className="font-bold text-slate-900">Rs. {med.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- RIGHT: CART & BILLING --- */}
      <div className="w-96 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Receipt className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Current Bill</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Receipt size={48} className="mb-4 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{item.brand_name}</p>
                  <p className="text-sm text-slate-500">Rs. {item.price} x {item.cartQuantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-blue-600 transition-colors"><Minus size={16}/></button>
                    <span className="w-8 text-center font-medium text-sm">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-blue-600 transition-colors"><Plus size={16}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          {/* Tax & Discount Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount (%)</label>
              <input type="number" min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax (%)</label>
              <input type="number" min="0" max="100" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span> <span className="font-medium">Rs. {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-green-600"><span>Discount</span> <span>- Rs. {discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-red-500"><span>Tax</span> <span>+ Rs. {taxAmount.toFixed(2)}</span></div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="font-bold text-slate-800">Grand Total</span>
            <span className="text-2xl font-black text-blue-600">Rs. {grandTotal.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || isProcessing}
            className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {isProcessing ? "Processing..." : (
              <> <FileText size={20} /> Generate Bill & Checkout </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}