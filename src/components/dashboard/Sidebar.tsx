import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Package,
  Radio,
  MessageSquare,
  ChevronUp,
  User,
  Settings,
  LogOut,
  X,
  Activity,
  HelpCircle,
  Blocks,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuId = 'sidebar-profile-menu';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Orders & Products', href: '/orders-products', icon: Package },
    { name: 'Integrations', href: '/integrations', icon: Blocks },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    const handleResize = () => {
      if (!profileOpen) return;
      calculatePopupPosition();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [profileOpen]);

  const calculatePopupPosition = () => {
    const trigger = profileRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    let top = rect.bottom + 5;
    let left = rect.left;

    // First pass with assumed size, refine when popup is measured
    const margin = 8;
    const defaultWidth = 320; // matches w-80
    const defaultHeight = 340; // approximate initial height
    if (left + defaultWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - defaultWidth - margin);
    }
    if (top + defaultHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - defaultHeight - 5);
    }
    setAnchorPos({ top, left });

    // Second pass with actual popup size (after render)
    requestAnimationFrame(() => {
      const popup = popupRef.current;
      if (!popup) return;
      const pw = popup.offsetWidth;
      const ph = popup.offsetHeight;
      let t = top;
      let l = left;
      if (l + pw > window.innerWidth - margin) {
        l = Math.max(margin, window.innerWidth - pw - margin);
      }
      if (t + ph > window.innerHeight - margin) {
        t = Math.max(margin, rect.top - ph - 5);
      }
      setAnchorPos({ top: t, left: l });
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-[#E2E8F0]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#E2E8F0]">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-lg"></div>
            <span className="text-lg font-bold text-gray-900">Loviq</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-[#F8FAFC]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="flex-1 px-4 py-4 overflow-y-auto"
          role="navigation"
          aria-label="Primary"
        >
          <div className="space-y-4">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-normal transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-[#7D2AE8]/10 text-[#7D2AE8]'
                      : 'text-gray-700 hover:bg-[#F8FAFC] hover:text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]
                  `}
                  aria-label={item.name}
                >
                  <IconComponent className="w-5 h-5" aria-hidden="true" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#E2E8F0] p-4 relative" ref={profileRef}>
          <div
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 hover:bg-[#F8FAFC] transition-colors duration-200 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
            aria-controls={menuId}
            aria-label="Open profile details"
            onClick={() => {
              const next = !profileOpen;
              setProfileOpen(next);
              if (next) calculatePopupPosition();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const next = !profileOpen;
                setProfileOpen(next);
                if (next) calculatePopupPosition();
              }
            }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Brand Account</div>
            </div>
            <ChevronUp className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </div>

          {profileOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
              onClick={() => setProfileOpen(false)}
              aria-hidden="true"
            />
          )}

          <div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Profile details"
            ref={popupRef}
            className={`fixed z-50 w-80 max-w-sm bg-white border border-[#E2E8F0] rounded-2xl shadow-lg popup-anchored transition-[opacity,transform] duration-300 ease-out ${profileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'
              }`}
            style={{ top: anchorPos.top, left: anchorPos.left }}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">Brand Account</div>
                  <div className="text-xs text-gray-600 truncate">brand@loviq.com</div>
                </div>
                <button
                  type="button"
                  className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D2AE8]"
                  aria-label="Close"
                  onClick={() => setProfileOpen(false)}
                >
                  <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-2">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-900 hover:bg-[#F8FAFC] active:scale-[.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]"
                >
                  <Settings className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/activity"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-900 hover:bg-[#F8FAFC] active:scale-[.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]"
                >
                  <Activity className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  <span>Activity</span>
                </Link>
                <Link
                  to="/help"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-900 hover:bg-[#F8FAFC] active:scale-[.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]"
                >
                  <HelpCircle className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  <span>Help Center</span>
                </Link>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">Basic Plan</div>
                  <div className="text-xs text-gray-600 truncate">12,000 views</div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 px-3 bg-[#7D2AE8] text-white rounded-md text-sm font-medium hover:bg-[#8D3AEC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7D2AE8]"
                  aria-label="Upgrade plan"
                >
                  Upgrade
                </button>
              </div>

              <Link
                to="/login"
                className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-900 hover:bg-[#F8FAFC] active:scale-[.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]"
                onClick={() => setProfileOpen(false)}
              >
                <LogOut className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <span>Sign Out</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
