/**
 * useUserProfile - Hook para gerenciar o perfil do usuário
 * 
 * Busca e gerencia o perfil completo do usuário autenticado,
 * incluindo dados de brand ou influencer conforme o tipo.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Profile, Brand, Influencer, UserProfile, UserType } from '../types/database';

interface UseUserProfileReturn {
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

export function useUserProfile(): UseUserProfileReturn {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar perfil base - usar maybeSingle para não dar erro quando não existe
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // Se não existe perfil, não é erro - usuário precisa completar onboarding
      if (!profileData) {
        setProfile(null);
        setBrand(null);
        setInfluencer(null);
        return;
      }

      setProfile(profileData);

      // Buscar dados específicos baseado no tipo
      if (profileData.user_type === 'brand') {
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandError) {
          throw brandError;
        }
        setBrand(brandData);
        setInfluencer(null);
      } else {
        const { data: influencerData, error: influencerError } = await supabase
          .from('influencers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (influencerError) {
          throw influencerError;
        }
        setInfluencer(influencerData);
        setBrand(null);
      }
    } catch (err) {
      console.error('[useUserProfile] Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Buscar perfil quando usuário mudar
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setBrand(null);
      setInfluencer(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchProfile]);

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
      setProfile(prev => prev ? { ...prev, ...data } : null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      return { error: message };
    }
  }, [user?.id]);

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
      setBrand(prev => prev ? { ...prev, ...data } : null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update brand';
      return { error: message };
    }
  }, [user?.id, profile?.user_type]);

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
      setInfluencer(prev => prev ? { ...prev, ...data } : null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update influencer';
      return { error: message };
    }
  }, [user?.id, profile?.user_type]);

  return {
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
  };
}

export default useUserProfile;

