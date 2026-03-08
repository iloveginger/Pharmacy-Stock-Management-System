import type { Metadata } from "next";
import "@/app/globals.css"; // Using the absolute path we fixed earlier
import Link from 'next/link';
import { LayoutDashboard, Pill, ShoppingCart } from 'lucide-react';
import Sidebar from "./components/Sidebar";

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
      
       <Sidebar/>
    
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}