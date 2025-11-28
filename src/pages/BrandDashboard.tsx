import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout, DashboardTab } from '../components/dashboard/DashboardLayout';
import { DashboardContent } from '../components/dashboard/DashboardContent';
import { WalletContent } from '../components/dashboard/WalletContent';

/**
 * BrandDashboard
 * 
 * Main dashboard page with sliding tab animation between Dashboard and Wallet views.
 * Uses URL-based navigation to maintain browser history and deep linking support.
 */
export const BrandDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from URL
  const getActiveTab = (): DashboardTab => {
    return location.pathname === '/wallet' ? 'wallet' : 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState<DashboardTab>(getActiveTab());

  // Sync tab state with URL changes (browser back/forward)
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Handle tab change with URL navigation
  const handleTabChange = (tab: DashboardTab) => {
    const path = tab === 'wallet' ? '/wallet' : '/dashboard';
    navigate(path, { replace: false });
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      dashboardContent={<DashboardContent />}
      walletContent={<WalletContent />}
    />
  );
};

export default BrandDashboard;
