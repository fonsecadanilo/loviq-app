/**
 * useUserProfile - Hook para acessar o perfil do usuário
 * 
 * Este hook agora utiliza o UserProfileContext para gerenciar os dados
 * de forma centralizada, evitando múltiplas requisições e garantindo
 * que os dados persistam durante a navegação entre páginas.
 * 
 * O cache em localStorage garante que não haja flash de "User" ou "My Store"
 * durante refresh da página.
 */

import { useUserProfileContext } from '../contexts/UserProfileContext';
import type { Profile, Brand, Influencer, UserType } from '../types/database';

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
  return useUserProfileContext();
}

export default useUserProfile;
