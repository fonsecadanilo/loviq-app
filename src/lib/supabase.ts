/**
 * Cliente Supabase centralizado para o projeto Loviq
 * 
 * Este arquivo fornece uma instância única do cliente Supabase
 * com tipagem completa do banco de dados.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Configuração do Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
        '[Supabase] Variáveis de ambiente não configuradas. ' +
        'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
    )
}

/**
 * Cliente Supabase com tipagem completa do banco de dados
 */
export const supabase = createClient<Database>(
    SUPABASE_URL || '',
    SUPABASE_ANON_KEY || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    }
)

/**
 * Verifica se o Supabase está configurado corretamente
 */
export const isSupabaseConfigured = (): boolean => {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/**
 * Códigos de erro do PostgREST que devem ser tratados silenciosamente
 * - PGRST116: Nenhuma linha encontrada (single() sem resultados)
 * - PGRST204: Nenhum conteúdo
 * - PGRST205: Tabela não existe no schema
 */
export const SILENT_ERROR_CODES = ['PGRST116', 'PGRST204', 'PGRST205']

/**
 * Verifica se um erro deve ser silenciado
 */
export const isSilentError = (errorCode: string | undefined): boolean => {
    return errorCode ? SILENT_ERROR_CODES.includes(errorCode) : false
}

export default supabase
