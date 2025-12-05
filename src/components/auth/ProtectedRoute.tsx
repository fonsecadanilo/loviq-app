/**
 * ProtectedRoute - Componente para proteger rotas autenticadas
 * 
 * Redireciona usuários não autenticados para a página de login.
 * Verifica se o usuário completou o onboarding.
 * Exibe um loader enquanto verifica o estado de autenticação e perfil.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const location = useLocation();

  // Exibe loader enquanto verifica autenticação ou perfil
  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    // Salva a localização atual para redirecionar após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redireciona para onboarding se:
  // 1. Não existe perfil (usuário novo via Google/OAuth)
  // 2. Perfil existe mas onboarding não foi completado
  const needsOnboarding = !profile || !profile.onboarding_completed;
  
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Se já completou onboarding e tenta acessar a página, redireciona para dashboard
  if (profile?.onboarding_completed && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
