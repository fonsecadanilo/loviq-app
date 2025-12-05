/**
 * Google Places Autocomplete Edge Function
 * 
 * Busca regiões dos EUA (estados, cidades, condados) usando a Google Places API.
 * Restrito apenas aos Estados Unidos para configuração de delivery regions.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Google Places API base URL
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'

interface PlacePrediction {
    place_id: string
    description: string
    structured_formatting: {
        main_text: string
        secondary_text: string
    }
    terms: Array<{
        offset: number
        value: string
    }>
    types: string[]
}

interface PlacesAutocompleteResponse {
    predictions: PlacePrediction[]
    status: string
    error_message?: string
}

interface RegionSuggestion {
    id: string
    name: string
    fullName: string
    type: 'state' | 'city' | 'county' | 'region'
}

/**
 * Determina o tipo de região baseado nos types retornados pela API
 */
function getRegionType(types: string[]): 'state' | 'city' | 'county' | 'region' {
    if (types.includes('administrative_area_level_1')) return 'state'
    if (types.includes('locality')) return 'city'
    if (types.includes('administrative_area_level_2')) return 'county'
    return 'region'
}

/**
 * Formata o nome da região para exibição
 */
function formatRegionName(prediction: PlacePrediction): { name: string; fullName: string } {
    const mainText = prediction.structured_formatting.main_text
    const secondaryText = prediction.structured_formatting.secondary_text || ''
    
    // Remove ", USA" ou ", United States" do final se presente
    const cleanSecondary = secondaryText
        .replace(/, USA$/i, '')
        .replace(/, United States$/i, '')
        .trim()
    
    return {
        name: mainText,
        fullName: cleanSecondary ? `${mainText}, ${cleanSecondary}` : mainText
    }
}

/**
 * Busca regiões usando a Google Places Autocomplete API
 */
async function searchRegions(query: string, apiKey: string, sessionToken?: string): Promise<RegionSuggestion[]> {
    console.log(`[google-places] Searching for: "${query}"`)
    
    const params = new URLSearchParams({
        input: query,
        key: apiKey,
        // Restringir apenas aos EUA
        components: 'country:us',
        // Tipos de lugares para buscar (regiões administrativas)
        types: '(regions)',
        // Idioma dos resultados
        language: 'en',
    })
    
    // Session token para billing optimization (se fornecido)
    if (sessionToken) {
        params.append('sessiontoken', sessionToken)
    }
    
    const url = `${PLACES_API_URL}?${params.toString()}`
    
    console.log(`[google-places] Calling Google API...`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
        const errorText = await response.text()
        console.error(`[google-places] HTTP error: ${response.status}`, errorText)
        throw new Error(`Google Places API HTTP error: ${response.status}`)
    }
    
    const data: PlacesAutocompleteResponse = await response.json()
    
    console.log(`[google-places] API status: ${data.status}, predictions: ${data.predictions?.length || 0}`)
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`[google-places] API error status: ${data.status}`, data.error_message)
        throw new Error(data.error_message || `API status: ${data.status}`)
    }
    
    if (!data.predictions || data.predictions.length === 0) {
        return []
    }
    
    // Transformar predictions em RegionSuggestions
    const suggestions: RegionSuggestion[] = data.predictions
        .filter(prediction => {
            // Filtrar apenas regiões administrativas dos EUA
            const isUSA = prediction.description.includes('USA') || 
                          prediction.description.includes('United States')
            const isRegion = prediction.types.some(type => 
                ['administrative_area_level_1', 'administrative_area_level_2', 
                 'locality', 'sublocality', 'neighborhood', 'postal_code'].includes(type)
            )
            return isUSA && isRegion
        })
        .map(prediction => {
            const { name, fullName } = formatRegionName(prediction)
            return {
                id: prediction.place_id,
                name,
                fullName,
                type: getRegionType(prediction.types)
            }
        })
    
    console.log(`[google-places] Returning ${suggestions.length} suggestions`)
    return suggestions
}

/**
 * Retorna lista de todos os estados dos EUA para seleção rápida
 */
function getUSStates(): RegionSuggestion[] {
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

serve(async (req) => {
    console.log('[google-places] Request received:', req.method)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    
    // Get API key from environment
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
    
    console.log('[google-places] API Key exists:', !!GOOGLE_PLACES_API_KEY)
    console.log('[google-places] API Key length:', GOOGLE_PLACES_API_KEY?.length || 0)
    
    // Validate API key
    if (!GOOGLE_PLACES_API_KEY) {
        console.error('[google-places] Missing GOOGLE_PLACES_API_KEY secret')
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Google Places API not configured',
                message: 'Please configure GOOGLE_PLACES_API_KEY in Supabase Edge Function Secrets'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    
    try {
        const body = await req.json()
        const { query, action, sessionToken } = body
        
        console.log('[google-places] Request params:', { action, query: query?.substring(0, 20) })
        
        // Ação: listar estados dos EUA
        if (action === 'list-states') {
            const states = getUSStates()
            return new Response(
                JSON.stringify({ 
                    success: true,
                    suggestions: states,
                    count: states.length
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        
        // Ação padrão: buscar regiões
        if (!query || typeof query !== 'string') {
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'Missing or invalid query parameter' 
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        
        // Mínimo de 2 caracteres para busca
        if (query.trim().length < 2) {
            return new Response(
                JSON.stringify({ 
                    success: true,
                    suggestions: [],
                    count: 0,
                    message: 'Query too short. Minimum 2 characters required.'
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        
        const suggestions = await searchRegions(query.trim(), GOOGLE_PLACES_API_KEY, sessionToken)
        
        return new Response(
            JSON.stringify({ 
                success: true,
                suggestions,
                count: suggestions.length
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        
    } catch (error) {
        console.error('[google-places] Error:', error)
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Failed to search regions', 
                message: error.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

