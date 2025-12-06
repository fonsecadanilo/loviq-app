/**
 * AuthCallback - Página de callback para autenticação OAuth
 * 
 * Esta página lida com:
 * - Redirecionamentos do Google OAuth
 * - Confirmação de email
 * - Links de recuperação de senha
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verifica se é um callback de recuperação de senha
        const type = searchParams.get('type');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Extrai tokens do hash ANTES de limpar (para alguns fluxos OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Limpa tokens sensíveis da URL imediatamente após extrair
        // O hash (#) contém tokens OAuth que não devem ficar visíveis
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        // O Supabase processa automaticamente o token da URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Error:', error);
          setStatus('error');
          setMessage(error.message);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (session) {
          setStatus('success');
          
          // Se for recuperação de senha, redireciona para a página de reset
          if (type === 'recovery') {
            setMessage('Redirecting to reset password...');
            setTimeout(() => navigate('/login?view=reset-password'), 1000);
          } else {
            setMessage('Login successful! Redirecting...');
            
            // Check if there's a pending Shopify callback URL
            const pendingShopifyUrl = sessionStorage.getItem('shopify_callback_url');
            if (pendingShopifyUrl) {
              sessionStorage.removeItem('shopify_callback_url');
              setMessage('Resuming Shopify connection...');
              setTimeout(() => {
                // Redirect to the saved Shopify callback URL
                window.location.href = pendingShopifyUrl;
              }, 1000);
            } else {
              setTimeout(() => navigate('/dashboard'), 1000);
            }
          }
        } else if (accessToken) {
          // Usa os tokens extraídos anteriormente
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            setStatus('error');
            setMessage(sessionError.message);
            setTimeout(() => navigate('/login'), 3000);
          } else {
            setStatus('success');
            setMessage('Login successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1000);
          }
        } else {
          setStatus('error');
          setMessage('No valid session found');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('[AuthCallback] Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-red-600">{message}</p>
            <p className="text-xs text-slate-400">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

