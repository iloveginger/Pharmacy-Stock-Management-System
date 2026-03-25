"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Pill, ReceiptText, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // --- NAVIGATION LINKS ---
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'POS / Billing', href: '/pos', icon: ReceiptText },
    { name: 'Inventory', href: '/inventory', icon: Pill },
  ];

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    // 1. Shred the digital ID cards
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    
    // 2. Teleport to login screen
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 p-6 h-screen fixed flex flex-col shadow-2xl z-40">
      
      {/* BRANDING */}
      <div className="mb-10">
        <h1 className="text-lg font-bold tracking-wide leading-tight text-white">
          Pharmacy Stock<br />
          <span className="text-sm font-normal text-slate-400">Management System</span>
        </h1>
      </div>
      
      {/* NAVIGATION */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20}/> <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT BUTTON  */}
      <div className="pt-6 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} /> <span>Log Out</span>
        </button>
      </div>

    </aside>
  );
}