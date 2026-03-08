import Link from 'next/link';
import { LayoutDashboard, Pill, ShoppingCart } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-blue-900 text-white p-6 space-y-8 h-screen fixed">
      <h1 className="text-lg font-bold tracking-wide leading-tight text-blue-100">
  Pharmacy Stock<br />
  <span className="text-sm font-normal text-blue-300">Management System</span>
</h1>
      <nav className="space-y-4">
        <Link href="/" className="flex items-center gap-3 p-2 hover:bg-blue-800 rounded-lg transition-all">
          <LayoutDashboard size={20}/> <span>Dashboard</span>
        </Link>
        <Link href="/inventory" className="flex items-center gap-3 p-2 hover:bg-blue-800 rounded-lg transition-all">
          <Pill size={20}/> <span>Inventory</span>
        </Link>
        <Link href="/pos" className="flex items-center gap-3 p-2 hover:bg-blue-800 rounded-lg transition-all">
          <ShoppingCart size={20}/> <span>Point of Sale</span>
        </Link>
      </nav>
    </aside>
  );
}