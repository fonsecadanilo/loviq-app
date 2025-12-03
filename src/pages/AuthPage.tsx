import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft, 
  Sparkles, 
  Store, 
  Building2, 
  AtSign, 
  Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AuthView = 'login' | 'register';
type UserType = 'creator' | 'brand';

interface AuthPageProps {
  initialView?: AuthView;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialView = 'login' }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>(initialView);
  const [userType, setUserType] = useState<UserType>('creator');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [handle, setHandle] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Update view if prop changes or navigation happens
  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    console.log('Logging in with:', { email, password });
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate register
    console.log('Registering as:', userType, {
      firstName,
      lastName,
      companyName: userType === 'brand' ? companyName : undefined,
      handle: userType === 'creator' ? handle : undefined,
      workEmail,
      registerPassword
    });
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const toggleView = (newView: AuthView) => {
    setView(newView);
    // Update URL without full reload if desired, or just keep internal state
    // navigate(newView === 'login' ? '/login' : '/signup'); 
    // Commented out to avoid re-mounting if route changes, but keeping URL in sync is good practice.
    window.history.pushState(null, '', newView === 'login' ? '/login' : '/signup');
  };

  return (
    <div className="min-h-screen flex w-full relative bg-white text-slate-600 antialiased selection:bg-purple-100 selection:text-purple-700 overflow-hidden font-sans">
      {/* Left Side: Visual / Brand Area (Visible only on LG screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#FAFAFA] relative overflow-hidden border-r border-slate-100 flex-col justify-between p-12 z-20">
        {/* Noise Overlay for Left Side */}
        <div className="absolute inset-0 bg-noise z-10 opacity-15"></div>

        {/* Gradient Background Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-[#FDF4FF]/30">
          {/* Large Fluid Shapes */}
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-purple-200/40 rounded-full blur-[100px] animate-liquid-1 mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-pink-100/60 rounded-full blur-[120px] animate-liquid-2 mix-blend-multiply"></div>
          <div className="absolute top-[40%] left-[30%] w-[60%] h-[60%] bg-blue-100/30 rounded-full blur-[90px] animate-liquid-3 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-2 mb-8">
            <img src="/LogoLoviqPretaNova.svg" alt="Loviq" className="h-8" />
          </div>
        </div>

        {/* Main Content Area with Updated Typography */}
        <div className="relative z-20 max-w-xl">
          <h2 className="text-3xl lg:text-4xl text-slate-900 mb-6 leading-tight tracking-tight">
            <span className="font-medium italic font-serif block mb-2">
              More than a new sales channel.
            </span>
            <span className="font-semibold block">
              It's your new way to convert more.
            </span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10 font-sans max-w-md">
            From concept to conversion — manage thousands of successful
            influencers ads seamlessly.
          </p>

          <div className="w-full h-[300px] relative overflow-hidden mt-4 mask-linear">
            <div className="flex gap-5 animate-scroll-left w-max items-center py-2 hover:[animation-play-state:paused]">
              {/* Carousel Items */}
              {[
                { img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", user: "@emilystyle" },
                { img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", user: "@joshlooks" },
                { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", user: "@annavogue" },
                { img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&q=80", user: "@sarahfit" },
                // Duplicates for marquee
                { img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", user: "@emilystyle" },
                { img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", user: "@joshlooks" },
                { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", user: "@annavogue" },
                { img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80", userImg: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&q=80", user: "@sarahfit" },
              ].map((item, idx) => (
                <div key={idx} className="relative w-[180px] h-[280px] rounded-2xl overflow-hidden shadow-lg border border-white/50 bg-slate-100 shrink-0 group">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Creator" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <span className="block w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full border border-white/30 overflow-hidden">
                        <img src={item.userImg} className="w-full h-full object-cover" alt="User" />
                      </div>
                      <span className="text-xs font-medium text-white">
                        {item.user}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 flex justify-between items-end text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          <span>© 2024 Loviq Inc.</span>
          <span>Privacy & Terms</span>
        </div>
      </div>

      {/* Right Side: Forms */}
      <div className="lg:w-1/2 flex flex-col lg:px-24 lg:py-12 overflow-y-auto bg-white w-full pt-6 pr-6 pb-28 pl-6 relative items-center justify-center">
        {/* Global Noise Overlay (Increased opacity) */}
        <div className="absolute inset-0 bg-noise z-10 opacity-15"></div>

        {/* Mobile Background Animation (Fluid) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 lg:hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[80%] bg-purple-100/50 rounded-full blur-[80px] animate-liquid-1"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[80%] bg-pink-100/40 rounded-full blur-[90px] animate-liquid-2"></div>
        </div>

        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <img src="/LogoLoviqPretaNova.svg" alt="Loviq" className="h-6" />
        </div>

        <div className="w-full max-w-[360px] mx-auto fade-in relative z-20">
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="block animate-fade-in">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-medium text-slate-900 font-serif mb-2">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your details to manage your connections.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full h-11 pl-10 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-medium text-slate-700">
                      Password
                    </label>
                    <a href="#" className="text-xs text-slate-400 hover:text-slate-900 transition-colors">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full h-11 pl-10 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md shadow-lg shadow-slate-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 group mt-2">
                  <span className="">Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-slate-200/60 flex-1"></div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Or continue with
                </span>
                <div className="h-px bg-slate-200/60 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 h-11 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 h-11 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.23-.93.63 0 2.45.16 3.63 1.39-3.16 1.66-2.66 4.97.68 6.36-.61 1.72-1.46 3.4-2.62 5.41zm-2.31-15.5c.67-.79 1.14-1.92.98-3.05-1.03.05-2.3.69-3.04 1.58-.62.72-1.14 1.86-1.01 3.01 1.16.09 2.36-.67 3.07-1.54z"></path>
                  </svg>
                  Apple
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => toggleView('register')} className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                  Create account
                </button>
              </p>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <div className="block animate-fade-in">
              <div className="mb-6 text-center">
                <button onClick={() => toggleView('login')} className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
                  <ChevronLeft className="w-3 h-3" />
                  Back to login
                </button>
                <h1 className="text-3xl font-medium text-slate-900 font-serif">
                  Join Loviq
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Select your profile type to begin.
                </p>
              </div>

              {/* Type Selector */}
              <div className="relative bg-slate-100 p-1 rounded-md flex mb-6">
                <div 
                  className={`absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white rounded-sm shadow-sm border border-slate-200/50 transition-transform duration-400 cubic-bezier(0.25, 1, 0.5, 1) z-0 ${userType === 'brand' ? 'translate-x-full' : 'translate-x-0'}`}
                ></div>
                <button 
                  onClick={() => setUserType('creator')} 
                  className={`relative z-10 w-1/2 py-2.5 text-sm font-medium text-center transition-colors duration-300 ${userType === 'creator' ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Creator
                  </span>
                </button>
                <button 
                  onClick={() => setUserType('brand')} 
                  className={`relative z-10 w-1/2 py-2.5 text-sm font-medium text-center transition-colors duration-300 ${userType === 'brand' ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Store className="w-3.5 h-3.5" />
                    Brand
                  </span>
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex gap-3">
                  <div className="space-y-1.5 w-1/2">
                    <label className="text-xs font-medium text-slate-700 ml-1">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John" 
                      className="w-full h-11 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5 w-1/2">
                    <label className="text-xs font-medium text-slate-700 ml-1">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe" 
                      className="w-full h-11 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {userType === 'brand' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-medium text-slate-700 ml-1">
                      Company Name
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-3.5 text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Loviq Inc." 
                        className="w-full h-11 pl-10 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {userType === 'creator' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-medium text-slate-700 ml-1">
                      Primary @Handle
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-3.5 text-slate-400">
                        <AtSign className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="instagram_user" 
                        className="w-full h-11 pl-10 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 ml-1">
                    Work Email
                  </label>
                  <input 
                    type="email" 
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full h-11 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 ml-1">
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min 8 chars" 
                    className="w-full h-11 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <div className="relative flex items-center h-5">
                    <input type="checkbox" id="terms" className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-slate-300 bg-white checked:border-slate-900 checked:bg-slate-900 transition-all focus:ring-2 focus:ring-slate-900/10" />
                    <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none leading-5">
                    I agree to the{' '}
                    <a href="#" className="text-slate-900 font-medium hover:underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-slate-900 font-medium hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <button 
                  type="submit"
                  className={
                    userType === 'brand' 
                    ? "w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md shadow-lg shadow-slate-200 hover:shadow-xl transition-all mt-4"
                    : "w-full h-11 bg-gradient-to-r from-[#FFF0F0] via-[#F3F0FF] to-[#FDF4FF] border border-purple-200 text-slate-900 hover:shadow-md text-sm font-medium rounded-md shadow-sm transition-all mt-4"
                  }
                >
                  Register as {userType === 'creator' ? 'Creator' : 'Brand'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

