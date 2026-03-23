"use client";

import './globals.css';
import Sidebar from './components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  
  // State to prevent the screen from "flickering" the dashboard before redirecting
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. Look for the token in the browser's memory
    const token = localStorage.getItem("token");

    // 2. If there is no token AND they aren't already on the login page -> Kick them out!
    if (!token && !isLoginPage) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router, isLoginPage]);

  // Show a blank screen for a split second while we check their ID
  if (isChecking && !isLoginPage) {
    return (
      <html lang="en">
        <body className="bg-slate-50 flex items-center justify-center h-screen">
          <div className="animate-pulse text-slate-400 font-medium">Verifying Security...</div>
        </body>
      </html>
    );
  }

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