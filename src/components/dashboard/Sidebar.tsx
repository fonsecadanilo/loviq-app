import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
  MessageCircle,
  Plug,
  LogOut,
  X,
  ChevronRight,
  User,
  CreditCard,
  Package,
  Store
} from 'lucide-react';
import LoviqLogo from '../../assets/LogoOficialLoviq.svg';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'Orders & Products', href: '/orders', icon: Package },
    { name: 'Influencers', href: '/influencers', icon: Users },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Store Integration', href: '/integrations', icon: Store },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen
        w-[280px] bg-white border-r border-[#E2E8F0]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col flex-shrink-0
      `}>

        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#E2E8F0] flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 ml-2">
            <img
              src={LoviqLogo}
              alt="Loviq Logo"
              className="h-7 w-auto"
            />
            <span className="px-1 py-0.5 text-[8px] font-bold bg-[#7D2AE8]/10 text-[#7D2AE8] rounded-full border border-[#7D2AE8]/20 tracking-wide">
              BETA
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
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

        {/* Profile Section */}
        <div className="border-t border-[#E2E8F0] p-3 flex-shrink-0 relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-600 truncate">john@example.com</p>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-2 z-50">
              <Link
                to="/integrations"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={onClose}
              >
                <Plug className="w-4 h-4" />
                <span>Integrations</span>
              </Link>
              <Link
                to="/wallet"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={onClose}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Settings</span>
              </Link>
              <div className="border-t border-[#E2E8F0] my-1"></div>
              <button
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                onClick={() => {
                  // Handle logout
                  console.log('Logout clicked');
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};