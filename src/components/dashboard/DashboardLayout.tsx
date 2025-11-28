import React, { useRef, useCallback } from 'react';
import { Bell, ChevronDown, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { SlidingTabsTransition, SlideDirection } from './SlidingTabsTransition';
import { useSidebar } from '../../contexts/SidebarContext';

/**
 * DashboardLayout
 * 
 * A unified layout component for Dashboard and Wallet tabs with smooth
 * sliding animations between them. This component manages:
 * - Sidebar state (collapsed/mobile) via SidebarContext
 * - Tab switching with direction-aware animations
 * - Shared header with tab navigation
 */

export type DashboardTab = 'dashboard' | 'wallet';

interface DashboardLayoutProps {
  /** The currently active tab */
  activeTab: DashboardTab;
  /** Callback when tab changes */
  onTabChange: (tab: DashboardTab) => void;
  /** Dashboard content component */
  dashboardContent: React.ReactNode;
  /** Wallet content component */
  walletContent: React.ReactNode;
}

// Tab configuration with indices for direction calculation
const TAB_CONFIG: Record<DashboardTab, { label: string; index: number }> = {
  dashboard: { label: 'Dashboard', index: 0 },
  wallet: { label: 'Wallet', index: 1 },
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  dashboardContent,
  walletContent,
}) => {
  // Sidebar state from context
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();

  // Track previous tab for direction calculation
  const previousTabRef = useRef<DashboardTab>(activeTab);
  
  // Calculate slide direction based on tab indices
  const getDirection = useCallback((): SlideDirection => {
    const currentIndex = TAB_CONFIG[activeTab].index;
    const previousIndex = TAB_CONFIG[previousTabRef.current].index;
    return currentIndex > previousIndex ? 'left' : 'right';
  }, [activeTab]);

  // Handle tab change with direction tracking
  const handleTabChange = useCallback((newTab: DashboardTab) => {
    if (newTab !== activeTab) {
      previousTabRef.current = activeTab;
      onTabChange(newTab);
    }
  }, [activeTab, onTabChange]);

  const direction = getDirection();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'wallet', label: 'Wallet' },
  ] as const;

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white w-full">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-[#FAFAFA] flex flex-col h-full relative overflow-y-auto">
        {/* Shared Header with Tab Navigation */}
        <header className="flex-shrink-0 flex z-30 pt-4 pr-8 pb-2 pl-8 relative backdrop-blur-xl items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <Menu size={24} />
            </button>

            {/* Tab Navigation with Sliding Indicator */}
            <div className="grid grid-cols-2 bg-violet-50/80 rounded-lg p-1 items-center relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative z-10 px-8 py-2 text-center text-xs font-semibold transition-colors duration-300 whitespace-nowrap rounded-[6px] ${
                    activeTab === tab.id
                      ? 'text-slate-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="dashboard-active-pill"
                      className="absolute inset-0 bg-slate-900 rounded-[6px] shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ zIndex: -1 }} // Ensure it stays behind text (which is z-10) but above container
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-px bg-slate-200 h-6 my-1" />
            <button className="flex hover:bg-slate-50 transition-all group rounded-xl pt-1 pr-1 pb-1 pl-1 gap-y-3 items-center gap-x-2">
              <div className="relative flex-shrink-0">
                <img
                  src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                  alt="Marcus"
                  className="w-8 h-8 rounded-full bg-slate-100 object-cover ring-2 ring-white shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </header>

        {/* Animated Content Area */}
        <div className="flex-1">
          <SlidingTabsTransition
            tabKey={activeTab}
            direction={direction}
            duration={0.25}
            offset={50}
            className="h-full"
          >
            {activeTab === 'dashboard' ? dashboardContent : walletContent}
          </SlidingTabsTransition>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
