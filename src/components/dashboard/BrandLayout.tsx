import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface BrandLayoutProps {
  children: React.ReactNode;
}

export const BrandLayout: React.FC<BrandLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:pl-72">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BrandLayout;