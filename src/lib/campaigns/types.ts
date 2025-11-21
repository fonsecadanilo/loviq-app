/**
 * Tipos relacionados ao Step 1 da criação de campanha
 */

export type CriteriaStatus = "valid" | "invalid" | "error";

export type SegmentKey =
  | "beauty_makeup"
  | "fashion_style"
  | "fitness_sports"
  | "lifestyle"
  | "tech_gadgets"
  | "gaming_esports"
  | "home_decor"
  | "food_cooking"
  | "mother_baby_family"
  | "business_education"
  | "health_wellness"
  | "other";

export interface Step1Segment {
  key: SegmentKey;
  label: string;
}

export interface Step1LiveConfig {
  index: number; // 1..totalLives
  followersMin: number | null;
  followersMax: number | null;
  segments: Step1Segment[];
}

export interface Step1Criteria {
  livesCount: CriteriaStatus; // critério 1
  followers: CriteriaStatus; // critério 2
  segments: CriteriaStatus; // critério 3
}

export interface Step1ParseResult {
  rawPrompt: string;
  totalLives: number | null;
  lives: Step1LiveConfig[];
  criteria: Step1Criteria;
}

/**
 * Tipos relacionados ao Step 2 da criação de campanha
 */

export type CreatorProfile = 'Micro' | 'Mid' | 'Top';

export type ContentFormat = 'Demo' | 'Unboxing' | 'Opinion';

export type Platform = 'Instagram' | 'TikTok' | 'Snapchat' | 'YouTube';

export type USRegion =
  | 'Northeast'
  | 'Southeast'
  | 'Midwest'
  | 'Southwest'
  | 'West'
  | 'Pacific Northwest'
  | 'Mountain West';

export type AgeRange =
  | '18-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55+';

export type LiveDuration = 30 | 60 | 90;

export interface MockProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

export interface Step2LiveConfig {
  liveIndex: number;
  title: string;
  contentFormat: ContentFormat | null;
  creatorAgeRange: AgeRange | null;
  focusLocal: boolean;
  region: USRegion | null;
  platformPreference: Platform | null;
  selectedProduct: MockProduct | null;
  liveDuration: LiveDuration | null;
  defineDate: boolean;
  preferredDate: string | null; // ISO date string
}

export interface Step2FormData {
  lives: Step2LiveConfig[];
}

