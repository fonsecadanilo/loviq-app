import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../../contexts/SidebarContext';

interface BrandLayoutProps {
  children: React.ReactNode;
}

export const BrandLayout: React.FC<BrandLayoutProps> = ({ children }) => {
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white w-full">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      <main className="flex-1 bg-[#FAFAFA] flex flex-col h-full overflow-hidden relative">
         <div className="flex-shrink-0">
            <TopBar onMenuClick={() => setMobileOpen(true)} />
         </div>
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
         </div>
      </main>
    </div>
  );
};

export default BrandLayout;
