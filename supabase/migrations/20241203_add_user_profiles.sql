-- =====================================================
-- Migração: Vincular usuários autenticados a perfis
-- =====================================================
-- Este script adiciona a estrutura necessária para
-- conectar auth.users com brands/influencers
-- =====================================================

-- 1. Criar enum para tipo de usuário (se não existir)
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('brand', 'creator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela de perfis (vincula auth.users com brands/influencers)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type public.user_type NOT NULL DEFAULT 'creator',
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Adicionar coluna user_id nas tabelas brands e influencers (se não existir)
DO $$ BEGIN
    ALTER TABLE public.brands ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.influencers ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);
CREATE INDEX IF NOT EXISTS idx_influencers_user_id ON public.influencers(user_id);

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at na tabela profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own brand" ON public.brands;
DROP POLICY IF EXISTS "Users can update own brand" ON public.brands;
DROP POLICY IF EXISTS "Users can insert own brand" ON public.brands;
DROP POLICY IF EXISTS "Influencers can view brands" ON public.brands;
DROP POLICY IF EXISTS "Users can view own influencer profile" ON public.influencers;
DROP POLICY IF EXISTS "Users can update own influencer profile" ON public.influencers;
DROP POLICY IF EXISTS "Users can insert own influencer profile" ON public.influencers;
DROP POLICY IF EXISTS "Brands can view influencers" ON public.influencers;

-- Policies para profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies para brands
CREATE POLICY "Users can view own brand"
    ON public.brands FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own brand"
    ON public.brands FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand"
    ON public.brands FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Brands podem ser visualizados por influencers (para campanhas)
CREATE POLICY "Influencers can view brands"
    ON public.brands FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.user_type = 'creator'
        )
    );

-- Policies para influencers
CREATE POLICY "Users can view own influencer profile"
    ON public.influencers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own influencer profile"
    ON public.influencers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own influencer profile"
    ON public.influencers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Brands podem ver influencers (para campanhas)
CREATE POLICY "Brands can view influencers"
    ON public.influencers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.user_type = 'brand'
        )
    );

-- =====================================================
-- Grants para usuários autenticados
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.brands TO authenticated;
GRANT ALL ON public.influencers TO authenticated;
