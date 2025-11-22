/**
 * Type definitions for influencer search
 */

export interface SearchParams {
    segments: string[];
    followerMin: number | null;
    followerMax: number | null;
    platforms: string[];
    ageRange: string | null;
    isValid: boolean;
}

export interface SearchTag {
    type: 'segment' | 'followers' | 'platform' | 'age';
    label: string;
    value: string;
}
