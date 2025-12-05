/**
 * UserProfileContext - Contexto global para dados do perfil do usuário
 * 
 * Gerencia o perfil do usuário de forma centralizada, com cache em localStorage
 * para evitar flash de loading durante navegação e refresh de página.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Profile, Brand, Influencer, UserType } from '../types/database';

interface UserProfileContextType {
  profile: Profile | null;
  brand: Brand | null;
  influencer: Influencer | null;
  userType: UserType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  updateBrand: (data: Partial<Brand>) => Promise<{ error: string | null }>;
  updateInfluencer: (data: Partial<Influencer>) => Promise<{ error: string | null }>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Chave para cache no localStorage
const CACHE_KEY = 'loviq_user_profile_cache';
const CACHE_EXPIRY_MS = 1000 * 60 * 60; // 1 hora

interface CachedData {
  profile: Profile | null;
  brand: Brand | null;
  influencer: Influencer | null;
  userId: string;
  timestamp: number;
}

// Função para ler cache do localStorage
const getCachedData = (userId: string | undefined): { profile: Profile | null; brand: Brand | null; influencer: Influencer | null } | null => {
  if (!userId) return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedData = JSON.parse(cached);
      // Verificar se o cache é do mesmo usuário e não expirou
      const isValidUser = parsed.userId === userId;
      const isNotExpired = Date.now() - parsed.timestamp < CACHE_EXPIRY_MS;
      
      if (isValidUser && isNotExpired) {
        return {
          profile: parsed.profile,
          brand: parsed.brand,
          influencer: parsed.influencer
        };
      }
    }
  } catch (e) {
    console.error('[UserProfileContext] Error reading cache:', e);
  }
  return null;
};

// Função para salvar cache no localStorage
const saveToCache = (data: { profile: Profile | null; brand: Brand | null; influencer: Influencer | null }, userId: string) => {
  try {
    const cacheData: CachedData = {
      ...data,
      userId,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.error('[UserProfileContext] Error saving cache:', e);
  }
};

// Função para limpar cache
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.error('[UserProfileContext] Error clearing cache:', e);
  }
};

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Tentar obter dados do cache na inicialização
  const initialCachedData = useMemo(() => getCachedData(user?.id), [user?.id]);
  
  const [profile, setProfile] = useState<Profile | null>(initialCachedData?.profile ?? null);
  const [brand, setBrand] = useState<Brand | null>(initialCachedData?.brand ?? null);
  const [influencer, setInfluencer] = useState<Influencer | null>(initialCachedData?.influencer ?? null);
  // Se temos cache, não mostrar loading inicial
  const [isLoading, setIsLoading] = useState(!initialCachedData?.profile);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Não mostrar loading se já temos dados em cache (background refresh)
    if (!profile && !initialCachedData?.profile) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Buscar perfil base
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // Se não existe perfil, usuário precisa completar onboarding
      if (!profileData) {
        setProfile(null);
        setBrand(null);
        setInfluencer(null);
        clearCache();
        return;
      }

      setProfile(profileData);

      let brandData: Brand | null = null;
      let influencerData: Influencer | null = null;

      // Buscar dados específicos baseado no tipo
      if (profileData.user_type === 'brand') {
        const { data, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandError) throw brandError;
        brandData = data;
        setBrand(data);
        setInfluencer(null);
      } else {
        const { data, error: influencerError } = await supabase
          .from('influencers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (influencerError) throw influencerError;
        influencerData = data;
        setInfluencer(data);
        setBrand(null);
      }

      // Salvar no cache
      saveToCache({ profile: profileData, brand: brandData, influencer: influencerData }, user.id);

    } catch (err) {
      console.error('[UserProfileContext] Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [user?.id, profile, initialCachedData?.profile]);

  // Buscar perfil quando usuário mudar ou autenticar
  useEffect(() => {
    if (isAuthenticated && !hasFetched) {
      fetchProfile();
    } else if (!isAuthenticated) {
      setProfile(null);
      setBrand(null);
      setInfluencer(null);
      setIsLoading(false);
      setHasFetched(false);
      clearCache();
    }
  }, [isAuthenticated, hasFetched, fetchProfile]);

  // Atualizar perfil base
  const updateProfile = useCallback(async (data: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setProfile(prev => {
        const updated = prev ? { ...prev, ...data } : null;
        // Atualizar cache
        if (updated) {
          saveToCache({ profile: updated, brand, influencer }, user.id);
        }
        return updated;
      });
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      return { error: message };
    }
  }, [user?.id, brand, influencer]);

  // Atualizar dados da brand
  const updateBrand = useCallback(async (data: Partial<Brand>): Promise<{ error: string | null }> => {
    if (!user?.id || profile?.user_type !== 'brand') {
      return { error: 'Not authorized' };
    }

    try {
      const { error: updateError } = await supabase
        .from('brands')
        .update(data)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setBrand(prev => {
        const updated = prev ? { ...prev, ...data } : null;
        // Atualizar cache
        if (updated) {
          saveToCache({ profile, brand: updated, influencer }, user.id);
        }
        return updated;
      });
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update brand';
      return { error: message };
    }
  }, [user?.id, profile, influencer]);

  // Atualizar dados do influencer
  const updateInfluencer = useCallback(async (data: Partial<Influencer>): Promise<{ error: string | null }> => {
    if (!user?.id || profile?.user_type !== 'creator') {
      return { error: 'Not authorized' };
    }

    try {
      const { error: updateError } = await supabase
        .from('influencers')
        .update(data)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setInfluencer(prev => {
        const updated = prev ? { ...prev, ...data } : null;
        // Atualizar cache
        if (updated) {
          saveToCache({ profile, brand, influencer: updated }, user.id);
        }
        return updated;
      });
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update influencer';
      return { error: message };
    }
  }, [user?.id, profile, brand]);

  const value = useMemo<UserProfileContextType>(() => ({
    profile,
    brand,
    influencer,
    userType: profile?.user_type ?? null,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updateBrand,
    updateInfluencer,
  }), [profile, brand, influencer, isLoading, error, fetchProfile, updateProfile, updateBrand, updateInfluencer]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
};

export default UserProfileContext;

