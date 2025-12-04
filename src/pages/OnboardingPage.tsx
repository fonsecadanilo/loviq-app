import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AtSign, 
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Store,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserType } from '../types/database';

export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  const [userType, setUserType] = useState<UserType>('creator');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [handle, setHandle] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Pre-fill data from user metadata or profile
  useEffect(() => {
    if (user?.user_metadata) {
      const { full_name, name } = user.user_metadata;
      if (full_name || name) {
        const nameParts = (full_name || name).split(' ');
        if (nameParts.length > 0 && !firstName) setFirstName(nameParts[0]);
        if (nameParts.length > 1 && !lastName) setLastName(nameParts.slice(1).join(' '));
      }
    }
    if (profile?.user_type) {
      setUserType(profile.user_type);
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (userType === 'brand' && !companyName) {
      setError('Company Name is required for brands');
      return;
    }

    if (userType === 'creator' && !handle) {
      setError('Handle is required for creators');
      return;
    }

    setIsLoading(true);

    try {
      if (!user?.id) throw new Error('No user found');

      // 1. Verificar se o perfil existe, se não existir criar, se existir atualizar
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Atualizar perfil existente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            onboarding_completed: true
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      } else {
        // Criar novo perfil (para usuários que entraram via Google/OAuth)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            onboarding_completed: true
          });

        if (profileError) throw profileError;
      }

      // 2. Gerenciar tabelas específicas (brands/influencers)
      if (userType === 'brand') {
        // Se mudou de creator para brand, pode ser necessário limpar a tabela influencers
        // Mas por segurança, vamos apenas garantir que a tabela brands existe
        
        // Verificar se já existe registro em brands
        const { data: existingBrand } = await supabase
          .from('brands')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingBrand) {
          await supabase
            .from('brands')
            .update({ name: companyName })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('brands')
            .insert({
              user_id: user.id,
              name: companyName,
              email: user.email
            });
        }

        // Opcional: Remover de influencers se existir (para evitar duplicidade lógica)
        await supabase.from('influencers').delete().eq('user_id', user.id);

      } else {
        // Creator logic
        const { data: existingInfluencer } = await supabase
          .from('influencers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingInfluencer) {
          await supabase
            .from('influencers')
            .update({ 
              name: `${firstName} ${lastName}`,
              social_media_handle: handle 
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('influencers')
            .insert({
              user_id: user.id,
              name: `${firstName} ${lastName}`,
              email: user.email,
              social_media_handle: handle
            });
        }

        // Opcional: Remover de brands se existir
        await supabase.from('brands').delete().eq('user_id', user.id);
      }

      // Força um reload completo para garantir que o estado seja atualizado
      // Isso evita race conditions entre o refetch e o ProtectedRoute
      window.location.href = '/dashboard';

    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full relative bg-white text-slate-600 antialiased selection:bg-purple-100 selection:text-purple-700 overflow-hidden font-sans">
      {/* Left Side: Visual / Brand Area (Same as AuthPage for consistency) */}
      <div className="hidden lg:flex w-1/2 bg-[#FAFAFA] relative overflow-hidden border-r border-slate-100 flex-col justify-between p-12 z-20">
        <div className="absolute inset-0 bg-noise z-10 opacity-15"></div>
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-[#FDF4FF]/30">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-purple-200/40 rounded-full blur-[100px] animate-liquid-1 mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-pink-100/60 rounded-full blur-[120px] animate-liquid-2 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-2 mb-8">
            <img src="/LogoLoviqPretaNova.svg" alt="Loviq" className="h-8" />
          </div>
        </div>

        <div className="relative z-20 max-w-xl">
          <h2 className="text-3xl lg:text-4xl text-slate-900 mb-6 leading-tight tracking-tight">
            <span className="font-medium italic font-serif block mb-2">
              Almost there...
            </span>
            <span className="font-semibold block">
              Complete your profile to get started.
            </span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10 font-sans max-w-md">
            We just need a few more details to customize your experience on Loviq.
          </p>
        </div>

        <div className="relative z-20 flex justify-between items-end text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          <span>© 2024 Loviq Inc.</span>
          <span>Privacy & Terms</span>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="lg:w-1/2 flex flex-col lg:px-24 lg:py-12 overflow-y-auto bg-white w-full pt-6 pr-6 pb-28 pl-6 relative items-center justify-center">
        <div className="absolute inset-0 bg-noise z-10 opacity-15"></div>
        
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <img src="/LogoLoviqPretaNova.svg" alt="Loviq" className="h-6" />
        </div>

        <div className="w-full max-w-[360px] mx-auto fade-in relative z-20">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-slate-900 font-serif mb-2">
              Complete Profile
            </h1>
            <p className="text-sm text-slate-500">
              Select your profile type and fill in the missing details.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div className="relative bg-slate-100 p-1 rounded-md flex mb-6">
              <div 
                className={`absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white rounded-sm shadow-sm border border-slate-200/50 transition-transform duration-400 cubic-bezier(0.25, 1, 0.5, 1) z-0 ${userType === 'brand' ? 'translate-x-full' : 'translate-x-0'}`}
              ></div>
              <button 
                type="button"
                onClick={() => setUserType('creator')} 
                className={`relative z-10 w-1/2 py-2.5 text-sm font-medium text-center transition-colors duration-300 ${userType === 'creator' ? 'text-slate-900' : 'text-slate-500'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Creator
                </span>
              </button>
              <button 
                type="button"
                onClick={() => setUserType('brand')} 
                className={`relative z-10 w-1/2 py-2.5 text-sm font-medium text-center transition-colors duration-300 ${userType === 'brand' ? 'text-slate-900' : 'text-slate-500'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Store className="w-3.5 h-3.5" />
                  Brand
                </span>
              </button>
            </div>

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
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm disabled:opacity-50"
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
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm disabled:opacity-50"
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
                    required={userType === 'brand'}
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm disabled:opacity-50"
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
                    required={userType === 'creator'}
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 pt-2">
              <div className="relative flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-slate-300 bg-white checked:border-slate-900 checked:bg-slate-900 transition-all focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50" 
                />
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
              disabled={isLoading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md shadow-lg shadow-slate-200 hover:shadow-xl transition-all mt-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

