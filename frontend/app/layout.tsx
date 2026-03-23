"use client";

import './globals.css';
import Sidebar from './components/Sidebar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className="flex bg-slate-50 text-slate-900 h-screen overflow-hidden">
        
        {!isLoginPage && <Sidebar />} 

        <main className={`flex-1 overflow-y-auto ${isLoginPage ? 'ml-0 p-0' : 'ml-64 p-8'}`}> 
          {children}
        </main>

      </body>
    </html>
  );
}