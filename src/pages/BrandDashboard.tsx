import React from 'react';
import { DashboardHome } from '../components/dashboard/DashboardHome';
import BrandLayout from '../components/dashboard/BrandLayout';

export const BrandDashboard: React.FC = () => {
  return (
    <BrandLayout>
      <DashboardHome />
    </BrandLayout>
  );
};