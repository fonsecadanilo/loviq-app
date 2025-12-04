/**
 * AuthContext - Contexto de autenticação da Loviq
 * 
 * Gerencia o estado de autenticação globalmente usando Supabase Auth.
 * Segue boas práticas de segurança:
 * - Tokens são gerenciados pelo Supabase SDK (não expostos)
 * - Sessão persistida de forma segura via httpOnly-like storage
 * - Refresh automático de tokens
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, metadata?: { firstName?: string; lastName?: string; userType?: string; handle?: string; companyName?: string }) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (email: string, token: string, type: 'recovery' | 'email') => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa o estado de autenticação
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('[Auth] Supabase não configurado. Autenticação desabilitada.');
      setIsLoading(false);
      return;
    }

    // Obtém sessão inicial e valida
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Erro ao obter sessão:', error);
          // Limpa sessão inválida
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }

        // Verifica se a sessão ainda é válida tentando obter o usuário
        if (currentSession) {
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !currentUser) {
            console.log('[Auth] Sessão inválida, limpando...');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            return;
          }
          
          setSession(currentSession);
          setUser(currentUser);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] Erro ao inicializar auth:', error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('[Auth] Estado alterado:', event);
        
        // Se o token expirou ou foi invalidado, limpa a sessão
        if (event === 'TOKEN_REFRESHED' && !newSession) {
          console.log('[Auth] Token inválido, limpando sessão...');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login com email e senha
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Cadastro com email e senha
  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string,
    metadata?: { firstName?: string; lastName?: string; userType?: string; handle?: string; companyName?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: metadata?.firstName,
            last_name: metadata?.lastName,
            user_type: metadata?.userType,
            handle: metadata?.handle,
            company_name: metadata?.companyName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Login com Google OAuth
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Logout
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Enviar email de recuperação de senha
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Atualizar senha (após reset)
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Verificar OTP (código de verificação)
  const verifyOtp = useCallback(async (email: string, token: string, type: 'recovery' | 'email') => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    verifyOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

