import type { Metadata } from "next";
import "@/app/globals.css"; // Using the absolute path we fixed earlier
import Link from 'next/link';
import { LayoutDashboard, Pill, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: "Pharmacy Pro",
  description: "Stock Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex bg-gray-100 min-h-screen">
        {/* Simple Sidebar directly in layout to avoid import issues */}
        <aside className="w-64 bg-blue-900 text-white p-6 fixed h-full">
          <h1 className="font-bold text-xl mb-8">Pharmacy Pro</h1>
          <nav className="space-y-4">
            <Link href="/" className="flex items-center gap-3 hover:text-blue-200">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link href="/inventory" className="flex items-center gap-3 hover:text-blue-200">
              <Pill size={20} /> Inventory
            </Link>
            <Link href="/pos" className="flex items-center gap-3 hover:text-blue-200">
              <ShoppingCart size={20} /> POS
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}