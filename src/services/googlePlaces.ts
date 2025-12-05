/**
 * Google Places Service
 * 
 * Serviço para buscar regiões dos EUA usando a Edge Function google-places-autocomplete.
 * Utilizado para configuração de delivery regions na Store Settings.
 */

import { supabase } from '../lib/supabase'

// Tipos
export interface RegionSuggestion {
    id: string
    name: string
    fullName: string
    type: 'state' | 'city' | 'county' | 'region'
}

export interface SearchRegionsResponse {
    success: boolean
    suggestions: RegionSuggestion[]
    count: number
    message?: string
    error?: string
}

// Cache para sessão (otimização de billing da Google)
let sessionToken: string | null = null
let sessionTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Gera um novo session token para a Google Places API
 * Session tokens agrupam autocomplete requests para billing
 */
function getSessionToken(): string {
    if (!sessionToken) {
        sessionToken = crypto.randomUUID()
        
        // Session tokens expiram após 3 minutos de inatividade
        if (sessionTimeout) {
            clearTimeout(sessionTimeout)
        }
        sessionTimeout = setTimeout(() => {
            sessionToken = null
        }, 3 * 60 * 1000)
    }
    return sessionToken
}

/**
 * Reseta o session token (chamar após selecionar uma região)
 */
export function resetSessionToken(): void {
    sessionToken = null
    if (sessionTimeout) {
        clearTimeout(sessionTimeout)
        sessionTimeout = null
    }
}

/**
 * Busca regiões dos EUA baseado em uma query
 * @param query - Texto para buscar (ex: "California", "New York")
 * @returns Lista de sugestões de regiões
 */
export async function searchRegions(query: string): Promise<RegionSuggestion[]> {
    if (!query || query.trim().length < 2) {
        return []
    }
    
    try {
        const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
            body: {
                query: query.trim(),
                sessionToken: getSessionToken()
            }
        })
        
        if (error) {
            console.error('[googlePlaces] Edge function error:', error)
            throw new Error(error.message || 'Failed to search regions')
        }
        
        const response = data as SearchRegionsResponse
        
        if (!response.success) {
            console.error('[googlePlaces] API error:', response.error)
            throw new Error(response.error || 'Failed to search regions')
        }
        
        return response.suggestions || []
        
    } catch (err) {
        console.error('[googlePlaces] Search error:', err)
        // Retorna array vazio em caso de erro para não quebrar a UI
        return []
    }
}

/**
 * Lista todos os estados dos EUA
 * Útil para seleção rápida de estados inteiros
 * @returns Lista de todos os 50 estados + DC
 */
export async function listUSStates(): Promise<RegionSuggestion[]> {
    try {
        const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
            body: {
                action: 'list-states'
            }
        })
        
        if (error) {
            console.error('[googlePlaces] Edge function error:', error)
            throw new Error(error.message || 'Failed to list states')
        }
        
        const response = data as SearchRegionsResponse
        
        if (!response.success) {
            console.error('[googlePlaces] API error:', response.error)
            throw new Error(response.error || 'Failed to list states')
        }
        
        return response.suggestions || []
        
    } catch (err) {
        console.error('[googlePlaces] List states error:', err)
        // Fallback: retorna lista estática se a API falhar
        return getFallbackUSStates()
    }
}

/**
 * Lista estática de estados dos EUA como fallback
 */
function getFallbackUSStates(): RegionSuggestion[] {
    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
        'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
        'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
        'District of Columbia'
    ]
    
    return states.map(state => ({
        id: `state-${state.toLowerCase().replace(/\s+/g, '-')}`,
        name: state,
        fullName: `${state}, USA`,
        type: 'state' as const
    }))
}

/**
 * Hook de debounce para busca de regiões
 * Evita chamadas excessivas à API durante digitação
 */
export function createDebouncedSearch(delay: number = 300) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    
    return function debouncedSearch(
        query: string, 
        callback: (suggestions: RegionSuggestion[]) => void
    ): void {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        
        if (!query || query.trim().length < 2) {
            callback([])
            return
        }
        
        timeoutId = setTimeout(async () => {
            const suggestions = await searchRegions(query)
            callback(suggestions)
        }, delay)
    }
}

