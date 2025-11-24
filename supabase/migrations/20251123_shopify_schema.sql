-- Create table for Shopify Integrations
-- Stores OAuth tokens and connection details securely
CREATE TABLE IF NOT EXISTS public.shopify_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Assumes auth.users or public.brands
    shop_domain TEXT NOT NULL,
    access_token TEXT NOT NULL, -- In production, this should be encrypted
    scope TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(brand_id, shop_domain)
);

-- Create table for Products
-- Mirrors products imported from Shopify
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- Shopify Product ID
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, archived, draft
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(brand_id, external_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopify_integrations
CREATE POLICY "Users can view their own integrations"
    ON public.shopify_integrations FOR SELECT
    USING (auth.uid() = brand_id);

CREATE POLICY "Users can insert their own integrations"
    ON public.shopify_integrations FOR INSERT
    WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can update their own integrations"
    ON public.shopify_integrations FOR UPDATE
    USING (auth.uid() = brand_id);

CREATE POLICY "Users can delete their own integrations"
    ON public.shopify_integrations FOR DELETE
    USING (auth.uid() = brand_id);

-- RLS Policies for products
CREATE POLICY "Users can view their own products"
    ON public.products FOR SELECT
    USING (auth.uid() = brand_id);

CREATE POLICY "Users can insert their own products"
    ON public.products FOR INSERT
    WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can update their own products"
    ON public.products FOR UPDATE
    USING (auth.uid() = brand_id);

CREATE POLICY "Users can delete their own products"
    ON public.products FOR DELETE
    USING (auth.uid() = brand_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopify_integrations_brand_id ON public.shopify_integrations(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_external_id ON public.products(external_id);
