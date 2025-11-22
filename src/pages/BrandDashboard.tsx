import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHome } from '../components/dashboard/DashboardHome';

export const BrandDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:pl-[280px]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="p-4 sm:p-6 lg:p-8">
        <DashboardHome />
      </main>
    </div>
  );
};