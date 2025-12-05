import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Megaphone,
  Store,
  MessageCircle,
  Settings,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Home
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { brand } = useUserProfile();
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const storeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(event.target as Node)) {
        setStoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, extraMatch: ['/wallet'] },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'My Store', href: '/store-integration', icon: Store },
    { name: 'Chat', href: '/chat', icon: MessageCircle, badge: '2', badgeColor: 'bg-red-50 text-red-500' },
  ];

  const isActive = (path: string, extraMatch?: string[]) => {
      if (location.pathname === path) return true;
      if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
      if (extraMatch && extraMatch.includes(location.pathname)) return true;
      return false;
  };

  const sidebarWidthClass = isCollapsed ? 'lg:w-[88px]' : 'lg:w-72';
  // Header classes based on state
  const headerPaddingClass = isCollapsed ? 'p-4 flex-col-reverse justify-center gap-4' : 'p-8 justify-between flex-row';

  // Classes for elements that should only appear when sidebar is fully expanded
  // Using opacity + visibility + delay so they fade in AFTER the width transition completes
  const expandedOnlyClass = isCollapsed 
    ? 'opacity-0 invisible max-h-0 overflow-hidden transition-all duration-200 ease-out' 
    : 'opacity-100 visible max-h-[500px] transition-all duration-300 ease-in delay-300';

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
            ${sidebarWidthClass}
            flex flex-col flex-shrink-0
            ${mobileOpen ? 'fixed inset-y-0 left-0 w-72 flex shadow-2xl' : 'hidden lg:flex'}
            transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1)
            z-20 overflow-hidden bg-white h-full border-slate-50 border-r relative
        `}
        data-collapsed={isCollapsed}
      >
        {/* Header: Logo & Toggle */}
        <div className={`sidebar-header flex min-h-[64px] transition-all duration-300 items-center ${headerPaddingClass}`}>
          <div className={`transition-all duration-300 ${isCollapsed ? 'w-6' : 'w-20'}`}>
            <img 
              src={isCollapsed ? "/LogoSimboloLoviqPreto.svg" : "/LogoLoviqPretaNova.svg"} 
              alt="Loviq" 
              className="w-full h-auto object-contain"
            />
          </div>

          <button
            onClick={toggleCollapse}
            className={`toggle-btn p-2 rounded-lg text-slate-400 hover:text-[#1e293b] hover:bg-slate-50 transition-colors focus:outline-none opacity-100 ${isCollapsed ? 'text-slate-600 bg-slate-50' : ''}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
             {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Navigation Wrapper */}
        <nav className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 scrollbar-hide pt-4 pr-4 pb-4 pl-4 space-y-1">
          
          {/* Store Switcher */}
          <div className={`relative mb-6 px-2 transition-all duration-300 ${isCollapsed ? 'px-0 mb-4' : ''}`} ref={storeDropdownRef}>
            <button
              onClick={() => !isCollapsed && setStoreDropdownOpen(!storeDropdownOpen)}
              className={`
                relative w-full flex items-center gap-2 px-2 py-3 rounded-md transition-all duration-200 group
                ${isCollapsed 
                  ? 'justify-center hover:bg-slate-50' 
                  : 'justify-between bg-slate-50/50 border border-slate-200/60 cursor-default'
                }
                ${storeDropdownOpen && !isCollapsed ? 'ring-2 ring-purple-100 border-purple-400' : ''}
              `}
              title={isCollapsed ? "Store: Feature coming soon" : "Switch Store"}
            >
              <div className="flex items-center gap-3 overflow-hidden w-full">
                {/* Icon */}
                <div className={`
                    flex items-center justify-center flex-shrink-0 transition-all duration-300
                    text-slate-400
                `}>
                    <LayoutGrid size={20} className="transition-colors" />
                </div>
                
                <div className={`text-left overflow-hidden flex items-center transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100 block'
                }`}>
                  <p className="text-sm font-medium text-slate-500 truncate leading-tight">
                    {brand?.name || 'My Store'}
                  </p>
                </div>
              </div>

              {!isCollapsed && (
                <ChevronRight 
                  size={14} 
                  className={`text-slate-300 transition-transform duration-300 flex-shrink-0 ${storeDropdownOpen ? 'rotate-90' : ''}`} 
                />
              )}
            </button>

            {/* Dropdown Content - Absolute Positioned */}
            <div className={`
              absolute top-full left-0 w-[calc(100%-16px)] mx-2 z-50 mt-1 transition-all duration-200 ease-out origin-top
              ${storeDropdownOpen && !isCollapsed ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
            `}>
              <div className="bg-white border border-slate-200 rounded-md shadow-lg p-3 text-center">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                      Feature Coming Soon 🚀
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                      Store switching will be available in future updates.
                  </p>
              </div>
            </div>
          </div>

          {/* Top Section Title - Only visible when fully expanded */}
          <div className={`min-h-0 pt-0 pb-4 pl-2 ${expandedOnlyClass}`}>
            <p className="nav-section-title uppercase text-xs font-medium text-slate-400 tracking-wider whitespace-nowrap">
              Main Menu
            </p>
          </div>

          {navItems.map((item) => {
            const active = isActive(item.href, item.extraMatch);
            const Icon = item.icon;

            if (isCollapsed) {
                return (
                     <Link
                        key={item.name}
                        to={item.href}
                        title={item.name}
                        className={`group flex items-center justify-center w-12 h-12 mx-auto rounded-md transition-all duration-300 relative my-1 ${
                          active 
                            ? 'bg-loviq-gradient text-slate-900 border border-purple-100/50 shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <Icon size={20} className="flex-shrink-0 transition-colors" />
                    </Link>
                )
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-3 transition-all text-sm font-medium rounded-md pt-3 pr-4 pb-3 pl-4 ${
                  active
                    ? 'text-slate-900 bg-loviq-gradient border border-purple-100/50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors w-[20px] h-[20px] ${
                    active ? '' : 'text-slate-400 group-hover:text-[#1e293b]'
                  }`}
                />
                <span className="nav-text whitespace-nowrap text-sm">{item.name}</span>
                {item.badge && (
                    <span className={`nav-badge ml-auto py-0.5 px-2 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                    {item.badge}
                    </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer flex-shrink-0 flex flex-col px-4 pb-4 space-y-1 overflow-hidden">
          
          {/* Upgrade Card - Only visible when fully expanded */}
          <div className={`upgrade-card pt-0 pb-6 ${expandedOnlyClass}`}>
            <div className="overflow-hidden group bg-loviq-gradient rounded-lg pt-6 pr-6 pb-6 pl-6 relative border border-purple-100/50">
              <div className="relative z-10">
                <h3 className="font-serif text-xl font-medium text-slate-900 mb-2">
                  Loviq Pro
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Unlock unlimited access to top influencers and advanced analytics.
                </p>
                <button className="w-full bg-slate-900 text-white text-xs font-medium py-3 rounded-md shadow-lg shadow-slate-200 hover:shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <Sparkles size={12} />
                  View Plans
                </button>
              </div>
              {/* Subtle glow effect instead of purple blob */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Support Section Title - Only visible when fully expanded */}
          <div className={`min-h-0 mb-2 pr-2 pl-2 ${expandedOnlyClass}`}>
             <p className="nav-section-title uppercase text-xs font-medium text-slate-400 tracking-wider pl-2 whitespace-nowrap">
              Support
            </p>
          </div>

          {/* Support Links */}
          {[
              { name: 'Settings', href: '/settings', icon: Settings },
              { name: 'Help & Support', href: '/support', icon: CircleHelp }
          ].map((item) => {
               const Icon = item.icon;
               if (isCollapsed) {
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            title={item.name}
                            className="group flex items-center justify-center w-12 h-12 mx-auto rounded-md transition-all duration-300 relative my-1 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <Icon size={20} className="flex-shrink-0 transition-colors" />
                        </Link>
                    )
               }
               return (
                <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all"
                >
                    <Icon size={20} className="w-5 h-5 text-slate-400 group-hover:text-[#1e293b] transition-colors flex-shrink-0" />
                    <span className="nav-text whitespace-nowrap">{item.name}</span>
                </Link>
               )
          })}

        </div>
      </aside>
    </>
  );
};
