import type { CreatorProfile, MockProduct, USRegion, AgeRange, ContentFormat, Platform, LiveDuration } from './types';

/**
 * Determina o perfil do creator baseado na quantidade de seguidores
 * Micro: até 50k
 * Mid: 50k a 500k
 * Top: acima de 500k
 */
export function getCreatorProfile(followersMin: number | null, followersMax: number | null): CreatorProfile {
    // Se não tem informação de seguidores, assume Micro como padrão
    if (followersMin === null && followersMax === null) {
        return 'Micro';
    }

    // Usa o valor máximo se disponível, senão usa o mínimo
    const followers = followersMax !== null ? followersMax : followersMin;

    if (followers === null) {
        return 'Micro';
    }

    if (followers <= 50000) {
        return 'Micro';
    } else if (followers <= 500000) {
        return 'Mid';
    } else {
        return 'Top';
    }
}

/**
 * Retorna lista de produtos mockados para seleção
 */
export function getMockProducts(): MockProduct[] {
    return [
        {
            id: 'prod-1',
            name: 'Wireless Bluetooth Headphones',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
            price: 79.99,
        },
        {
            id: 'prod-2',
            name: 'Smart Fitness Watch',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
            price: 199.99,
        },
        {
            id: 'prod-3',
            name: 'Portable Phone Charger',
            imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&h=200&fit=crop',
            price: 29.99,
        },
        {
            id: 'prod-4',
            name: 'Organic Skincare Set',
            imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
            price: 89.99,
        },
        {
            id: 'prod-5',
            name: 'Premium Yoga Mat',
            imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200&h=200&fit=crop',
            price: 49.99,
        },
        {
            id: 'prod-6',
            name: 'Stainless Steel Water Bottle',
            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop',
            price: 24.99,
        },
    ];
}

/**
 * Retorna lista de regiões dos EUA
 */
export function getUSRegions(): USRegion[] {
    return [
        'Northeast',
        'Southeast',
        'Midwest',
        'Southwest',
        'West',
        'Pacific Northwest',
        'Mountain West',
    ];
}

/**
 * Retorna lista de faixas etárias
 */
export function getAgeRanges(): AgeRange[] {
    return [
        '18-24',
        '25-34',
        '35-44',
        '45-54',
        '55+',
    ];
}

/**
 * Retorna lista de formatos de conteúdo
 */
export function getContentFormats(): ContentFormat[] {
    return ['Demo', 'Unboxing', 'Opinion'];
}

/**
 * Retorna lista de plataformas
 */
export function getPlatforms(): Platform[] {
    return ['Instagram', 'TikTok', 'Snapchat', 'YouTube'];
}

/**
 * Retorna lista de durações de live
 */
export function getLiveDurations(): LiveDuration[] {
    return [30, 60, 90];
}

/**
 * Formata a duração da live para exibição
 */
export function formatLiveDuration(duration: LiveDuration): string {
    return `${duration} min`;
}

/**
 * Retorna a cor do badge baseado no perfil do creator
 */
export function getProfileBadgeColor(profile: CreatorProfile): { bg: string; text: string; border: string } {
    switch (profile) {
        case 'Micro':
            return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        case 'Mid':
            return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
        case 'Top':
            return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    }
}
