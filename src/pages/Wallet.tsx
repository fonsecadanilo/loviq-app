import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout, DashboardTab } from '../components/dashboard/DashboardLayout';
import { DashboardContent } from '../components/dashboard/DashboardContent';
import { WalletContent } from '../components/dashboard/WalletContent';

/**
 * Wallet
 * 
 * Wallet page that shares the same layout as Dashboard with sliding animations.
 * This component is a mirror of BrandDashboard but with wallet as the default tab.
 */
export const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine active tab from URL
  const getActiveTab = (): DashboardTab => {
    return location.pathname === '/wallet' ? 'wallet' : 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState<DashboardTab>(getActiveTab());

  // Sync tab state with URL changes (browser back/forward)
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change with URL navigation
  const handleTabChange = (tab: DashboardTab) => {
    const path = tab === 'wallet' ? '/wallet' : '/dashboard';
    navigate(path, { replace: false });
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      dashboardContent={<DashboardContent isLoading={isLoading} />}
      walletContent={<WalletContent isLoading={isLoading} />}
    />
  );
};

export default Wallet;
