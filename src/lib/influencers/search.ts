/**
 * Intelligent search parser for influencer discovery
 * Extracts parameters from natural language descriptions
 */

import type { SearchParams, SearchTag } from './types';

/**
 * Normalizes a number token (e.g., "10k", "1M", "100 mil")
 */
function normalizeNumberToken(token: string): number | null {
    const cleaned = token.trim().toLowerCase();

    // Case 1: Millions (1M, 1.5M, "milhão", "milhões")
    const mMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:m|mi|milhão|milhões|million|millions)?$/);
    if (mMatch && (cleaned.includes('m') || cleaned.includes('milh') || cleaned.includes('million'))) {
        const num = parseFloat(mMatch[1]);
        if (!isNaN(num)) {
            return Math.round(num * 1_000_000);
        }
    }

    // Case 2: Thousands with k (10k, 1.5k)
    const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*k$/);
    if (kMatch) {
        const num = parseFloat(kMatch[1]);
        if (!isNaN(num)) {
            return Math.round(num * 1_000);
        }
    }

    // Case 3: "mil" or "thousand"
    if (cleaned.includes('mil') && !cleaned.includes('milh')) {
        const numMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:mil|thousand)/);
        if (numMatch) {
            const num = parseFloat(numMatch[1].replace(',', '.'));
            if (!isNaN(num)) {
                return Math.round(num * 1_000);
            }
        }
    }

    // Case 4: Simple number
    const simpleMatch = cleaned.match(/^(\d+)$/);
    if (simpleMatch) {
        const num = parseInt(simpleMatch[1], 10);
        if (!isNaN(num)) {
            return num;
        }
    }

    return null;
}

/**
 * Extract segments from the prompt
 */
function extractSegments(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const segments: string[] = [];

    const segmentMapping: Array<{ keywords: string[]; label: string }> = [
        {
            keywords: ['makeup', 'maquiagem', 'beleza', 'beauty', 'cosméticos', 'skincare'],
            label: 'Beauty',
        },
        {
            keywords: ['moda', 'fashion', 'style', 'estilo', 'roupa', 'clothing'],
            label: 'Fashion',
        },
        {
            keywords: ['fitness', 'gym', 'academia', 'workout', 'treino', 'exercício', 'exercise'],
            label: 'Fitness',
        },
        {
            keywords: ['lifestyle', 'estilo de vida', 'rotina', 'vida'],
            label: 'Lifestyle',
        },
        {
            keywords: ['tech', 'tecnologia', 'gadgets', 'eletrônicos'],
            label: 'Tech',
        },
        {
            keywords: ['gaming', 'games', 'jogos', 'gamer'],
            label: 'Gaming',
        },
        {
            keywords: ['food', 'comida', 'cooking', 'culinária', 'receita', 'gastronomia'],
            label: 'Food',
        },
        {
            keywords: ['travel', 'viagem', 'turismo', 'tourism'],
            label: 'Travel',
        },
        {
            keywords: ['health', 'saúde', 'wellness', 'bem-estar'],
            label: 'Health',
        },
    ];

    for (const mapping of segmentMapping) {
        for (const keyword of mapping.keywords) {
            if (lowerPrompt.includes(keyword)) {
                if (!segments.includes(mapping.label)) {
                    segments.push(mapping.label);
                }
            }
        }
    }

    return segments;
}

/**
 * Extract follower count/range from the prompt
 */
function extractFollowerCount(prompt: string): {
    followerMin: number | null;
    followerMax: number | null;
} {
    const lowerPrompt = prompt.toLowerCase();

    // Pattern 1: Range (entre 10k e 50k, between 10k and 50k)
    const rangePatterns = [
        /(?:entre|between)\s+(\d+(?:\.\d+)?)\s*(?:k|mil|thousand)?\s+(?:e|and|a|to)\s+(\d+(?:\.\d+)?)\s*(?:k|mil|thousand)?/i,
        /(\d+(?:\.\d+)?)\s*(?:k|mil)\s*(?:a|to|-)\s*(\d+(?:\.\d+)?)\s*(?:k|mil)/i,
    ];

    for (const pattern of rangePatterns) {
        const match = prompt.match(pattern);
        if (match) {
            const min = normalizeNumberToken(match[1] + (match[0].includes('k') || match[0].includes('mil') ? 'k' : ''));
            const max = normalizeNumberToken(match[2] + (match[0].includes('k') || match[0].includes('mil') ? 'k' : ''));
            if (min !== null && max !== null) {
                return { followerMin: min, followerMax: max };
            }
        }
    }

    // Pattern 2: "mais de" / "acima de" / "above" / "more than"
    const abovePattern = /(?:mais\s+de|acima\s+de|above|more\s+than|over)\s+(\d+(?:\.\d+)?)\s*(?:k|mil|m|milhão|milhões|thousand|million)?/i;
    const aboveMatch = prompt.match(abovePattern);
    if (aboveMatch) {
        const value = normalizeNumberToken(aboveMatch[1] + (aboveMatch[0].includes('k') ? 'k' : aboveMatch[0].includes('m') || aboveMatch[0].includes('milh') ? 'm' : ''));
        if (value !== null) {
            return { followerMin: value, followerMax: null };
        }
    }

    // Pattern 3: "até" / "up to"
    const upToPattern = /(?:até|up\s+to|until)\s+(\d+(?:\.\d+)?)\s*(?:k|mil|m|milhão|thousand|million)?/i;
    const upToMatch = prompt.match(upToPattern);
    if (upToMatch) {
        const value = normalizeNumberToken(upToMatch[1] + (upToMatch[0].includes('k') ? 'k' : upToMatch[0].includes('m') || upToMatch[0].includes('milh') ? 'm' : ''));
        if (value !== null) {
            return { followerMin: null, followerMax: value };
        }
    }

    // Pattern 4: Simple number with k/mil/m near "seguidores"/"followers"
    const simplePattern = /(\d+(?:\.\d+)?)\s*(?:k|mil|m|milhão|milhões|thousand|million)\s*(?:de\s+)?(?:seguidores?|followers?)/i;
    const simpleMatch = prompt.match(simplePattern);
    if (simpleMatch) {
        const fullMatch = simpleMatch[0];
        let suffix = 'k';
        if (fullMatch.includes('m') || fullMatch.includes('milh') || fullMatch.includes('million')) {
            suffix = 'm';
        } else if (fullMatch.includes('k')) {
            suffix = 'k';
        } else if (fullMatch.includes('mil')) {
            suffix = 'k';
        }
        const value = normalizeNumberToken(simpleMatch[1] + suffix);
        if (value !== null) {
            return { followerMin: value, followerMax: value };
        }
    }

    return { followerMin: null, followerMax: null };
}

/**
 * Extract platforms from the prompt
 */
function extractPlatforms(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const platforms: string[] = [];

    const platformMapping = [
        { keywords: ['instagram', 'insta', 'ig'], label: 'Instagram' },
        { keywords: ['tiktok', 'tik tok'], label: 'TikTok' },
        { keywords: ['youtube', 'yt'], label: 'YouTube' },
        { keywords: ['twitter', 'x'], label: 'Twitter' },
    ];

    for (const mapping of platformMapping) {
        for (const keyword of mapping.keywords) {
            if (lowerPrompt.includes(keyword)) {
                if (!platforms.includes(mapping.label)) {
                    platforms.push(mapping.label);
                }
            }
        }
    }

    return platforms;
}

/**
 * Extract age range from the prompt
 */
function extractAgeRange(prompt: string): string | null {
    const lowerPrompt = prompt.toLowerCase();

    const ageKeywords = [
        { keywords: ['jovem', 'young', 'youth', 'adolescent', 'teen'], label: 'Jovem' },
        { keywords: ['adulto', 'adult'], label: 'Adulto' },
        { keywords: ['maduro', 'mature', 'senior'], label: 'Maduro' },
    ];

    for (const mapping of ageKeywords) {
        for (const keyword of mapping.keywords) {
            if (lowerPrompt.includes(keyword)) {
                return mapping.label;
            }
        }
    }

    return null;
}

/**
 * Main function: Parse influencer search prompt
 */
export function parseInfluencerSearch(prompt: string): SearchParams {
    const segments = extractSegments(prompt);
    const { followerMin, followerMax } = extractFollowerCount(prompt);
    const platforms = extractPlatforms(prompt);
    const ageRange = extractAgeRange(prompt);

    const isValid =
        segments.length > 0 ||
        followerMin !== null ||
        followerMax !== null ||
        platforms.length > 0 ||
        ageRange !== null;

    return {
        segments,
        followerMin,
        followerMax,
        platforms,
        ageRange,
        isValid,
    };
}

/**
 * Convert SearchParams to display tags
 */
export function searchParamsToTags(params: SearchParams): SearchTag[] {
    const tags: SearchTag[] = [];

    // Segments
    for (const segment of params.segments) {
        tags.push({
            type: 'segment',
            label: segment,
            value: segment,
        });
    }

    // Platforms
    for (const platform of params.platforms) {
        tags.push({
            type: 'platform',
            label: platform,
            value: platform,
        });
    }

    // Followers
    if (params.followerMin !== null || params.followerMax !== null) {
        let label = '';
        if (params.followerMin !== null && params.followerMax !== null) {
            if (params.followerMin === params.followerMax) {
                label = `${formatFollowerNumber(params.followerMin)} followers`;
            } else {
                label = `${formatFollowerNumber(params.followerMin)} - ${formatFollowerNumber(params.followerMax)}`;
            }
        } else if (params.followerMin !== null) {
            label = `${formatFollowerNumber(params.followerMin)}+ followers`;
        } else if (params.followerMax !== null) {
            label = `até ${formatFollowerNumber(params.followerMax)}`;
        }

        tags.push({
            type: 'followers',
            label,
            value: label,
        });
    }

    // Age
    if (params.ageRange) {
        tags.push({
            type: 'age',
            label: params.ageRange,
            value: params.ageRange,
        });
    }

    return tags;
}

/**
 * Format follower number for display
 */
function formatFollowerNumber(num: number): string {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(0)}k`;
    }
    return num.toString();
}
