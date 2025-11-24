import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// In a real app, these should be in .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ShopifyIntegration {
    id: string;
    shop_domain: string;
    created_at: string;
}

export const ShopifyService = {
    /**
     * Checks if the current user has a connected Shopify store.
     */
    async getIntegrationStatus(userId: string): Promise<ShopifyIntegration | null> {
        // Check if Supabase is configured
        if (!SUPABASE_URL || SUPABASE_URL.includes('your-project') || SUPABASE_URL.includes('sua-url')) {
            // Return null (not connected) silently for demo
            return null;
        }

        const { data, error } = await supabase
            .from('shopify_integrations')
            .select('*')
            .eq('brand_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            console.error('Error fetching integration status:', error);
            return null;
        }

        return data;
    },

    /**
     * Initiates the OAuth flow by calling the Edge Function.
     * Note: User provided store password 'loviq01' (for development stores), 
     * but OAuth flow typically redirects to admin login.
     */
    async connectStore(shopDomain: string) {
        // Check if Supabase is configured
        if (!SUPABASE_URL || SUPABASE_URL.includes('your-project') || SUPABASE_URL.includes('sua-url')) {
            console.warn('Supabase credentials missing. Simulating connection for demo.');

            // Mock successful behavior for demo/preview
            return new Promise((resolve) => {
                setTimeout(() => {
                    alert('Simulação: Redirecionando para Shopify OAuth...\n(Configure o Supabase para funcionar realmente)');
                    // In a real app this would redirect, but for demo we just resolve
                    resolve({ url: `https://${shopDomain}/admin` });
                }, 1000);
            });
        }

        try {
            const { data, error } = await supabase.functions.invoke('shopify-auth', {
                body: { shop: shopDomain },
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error initiating connection:', error);
            // Fallback for demo if Edge Function is not deployed
            console.warn('Edge Function failed. Simulating connection for demo.');
            alert('Atenção: A Edge Function "shopify-auth" não foi encontrada ou falhou.\nSimulando conexão para demonstração.');
        }
    },

    /**
     * Triggers product synchronization.
     * In a real implementation, this would call another Edge Function or backend API.
     */
    async syncProducts(brandId: string) {
        // Mock implementation for now, as the backend sync logic is complex
        console.log('Syncing products for brand:', brandId);
        return new Promise((resolve) => setTimeout(resolve, 2000));
    }
};
