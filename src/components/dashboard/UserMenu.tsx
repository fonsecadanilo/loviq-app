import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  Settings, 
  Receipt,
  LogOut, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types/database';

interface UserMenuProps {
  userProfile: UserProfile | null;
  isScrolled?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ userProfile, isScrolled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Mock consumption data - TODO: Fetch from backend
  const consumptionData = {
    used: 750,
    total: 1000,
    unit: 'min'
  };
  
  const consumptionPercentage = Math.min(
    (consumptionData.used / consumptionData.total) * 100, 
    100
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      // Always navigate to login, even if there's an error
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get display name - prioritize first_name from profile, then brand/influencer name
  const firstName = userProfile?.profile?.first_name;
  const lastName = userProfile?.profile?.last_name;
  const fullName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || userProfile?.brand?.name || userProfile?.influencer?.name || 'User';
  
  // For trigger button, show only first name
  const displayName = firstName || userProfile?.brand?.name || userProfile?.influencer?.name || 'User';
  
  // Get email - prioritize brand/influencer email, fallback to auth user email
  const profileEmail = userProfile?.profile?.user_type === 'brand' 
    ? userProfile?.brand?.email 
    : userProfile?.influencer?.email;
  const displayEmail = profileEmail || user?.email || 'user@loviq.com';

  // Get avatar URL - prioritize profile avatar, fallback to Google OAuth avatar from user metadata
  const avatarUrl = userProfile?.profile?.avatar_url || 
                    (user?.user_metadata?.avatar_url as string | undefined) || 
                    (user?.user_metadata?.picture as string | undefined);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button - Matches HTML Design */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex hover:border-purple-200 hover:bg-slate-50 transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-50 focus:border-purple-200 bg-white min-w-[240px] max-w-xs border rounded-lg mx-0 px-3 py-2 items-center justify-between ${
          isScrolled && !isOpen ? 'border-transparent shadow-none' : 'border-slate-100 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="w-8 h-8 rounded-full object-cover border border-slate-100 ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 ring-2 ring-white shadow-sm flex items-center justify-center">
                 <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-900 tracking-tight">
              {displayName}
            </p>
            <p className="text-[10px] font-normal text-slate-500 truncate max-w-[120px]">
              {displayEmail}
            </p>
          </div>
        </div>
        
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        )}
      </button>

      {/* Dropdown Menu - Matches HTML Design */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 transform origin-top transition-all overflow-hidden z-50 animate-fade-in">
          
          {/* Section 1: User Info with Photo */}
          <div className="px-3 py-2 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={fullName} 
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                />
              ) : (
                 <div className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                 </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-medium text-slate-400 mb-0.5">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate leading-none">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Section 2: Consumption Card */}
          <div className="p-2">
            <div className="relative overflow-hidden border border-purple-50 rounded-lg isolate p-4">
              <div className="bg-noise absolute inset-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-300/30 rounded-full blur-[24px] animate-liquid-1"></div>
              <div className="absolute top-4 -right-10 w-32 h-32 bg-fuchsia-300/30 rounded-full blur-[24px] animate-liquid-2"></div>
              <div className="absolute -bottom-6 left-8 w-32 h-32 bg-rose-300/30 rounded-full blur-[24px] animate-liquid-3"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white shadow-sm ring-1 ring-white/10">
                    PRO
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    Current Plan
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900">
                    Live Minutes
                  </span>
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    {consumptionData.used}/{consumptionData.total} {consumptionData.unit}
                  </span>
                </div>

              <div className="w-full bg-white/60 rounded-full h-2 border border-purple-100/30 mb-3">
                <div 
                  className="bg-slate-900 h-2 rounded-full" 
                  style={{ width: `${consumptionPercentage}%` }}
                />
              </div>

                <button className="w-full bg-slate-900 text-white text-xs font-medium py-2 rounded-sm shadow-md shadow-slate-200 hover:shadow-lg hover:bg-slate-800 transition-all">
                  Buy more minutes
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-50 mx-2"></div>

          {/* Section 3: Menu Items */}
          <div className="p-2 space-y-1">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="font-medium">My Profile</span>
              <span className="ml-auto text-xs text-slate-400 font-normal font-sans">
                ⌘P
              </span>
            </Link>

            <Link 
              to="/wallet" 
              className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <Wallet className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="font-medium">Wallet</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                  $2,400
                </span>
              </div>
            </Link>

            <Link 
              to="/settings" 
              className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-50 mx-2"></div>

          {/* Section 4: Billing */}
          <div className="p-2">
            <Link 
              to="/billing" 
              className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <Receipt className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="font-medium">Billing & Invoices</span>
              <span className="ml-auto w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-100 mx-1.5"></div>

          {/* Section 5: Logout */}
          <div className="p-2">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className={`w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors ${isLoggingOut ? 'animate-spin' : ''}`} />
              <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="bg-slate-50/50 px-4 py-2 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-medium font-mono">
              v2.4.0
            </span>
            <span className="text-[10px] text-slate-900 font-medium tracking-tight font-serif">
              Loviq.
            </span>
          </div>

        </div>
      )}
    </div>
  );
};

