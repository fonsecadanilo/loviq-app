import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  Wallet, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'Influencers', href: '/influencers', icon: Users },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen
        w-72 bg-white border-r border-[#E2E8F0]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col flex-shrink-0
      `}>
        
        {/* Header do Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#E2E8F0] flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-lg flex-shrink-0"></div>
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">Loviq</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  ${isActive(item.href) 
                    ? 'bg-[#7D2AE8]/10 text-[#7D2AE8]' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="truncate min-w-0">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Footer do Sidebar */}
        <div className="border-t border-[#E2E8F0] p-4 flex-shrink-0">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};