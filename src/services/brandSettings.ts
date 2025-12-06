import { supabase } from '../lib/supabase';

export interface BrandSettings {
  id: number;
  user_id: string | null;
  name: string;
  logo_url: string | null;
  segment: string | null;
  website: string | null;
  email: string | null;       // Using existing brands.email field
  phone_number: string | null; // Using existing brands.phone_number field
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  stripe_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandSettingsUpdate {
  name?: string;
  logo_url?: string | null;
  segment?: string | null;
  website?: string | null;
  email?: string | null;
  phone_number?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
}

// Business segments available
export const BRAND_SEGMENTS = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Electronics',
  'Home & Garden',
  'Health & Wellness',
  'Food & Beverages',
  'Sports & Outdoors',
  'Toys & Games',
  'Jewelry & Accessories',
  'Art & Crafts',
  'Pet Supplies',
  'Other'
] as const;

/**
 * Get brand settings for the current user
 */
export async function getBrandSettings(): Promise<BrandSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('[BrandSettings] No authenticated user');
    return null;
  }

  // Get the brand for this user
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (brandError || !brand) {
    console.error('[BrandSettings] Error fetching brand:', brandError);
    return null;
  }

  // Map the database response to our BrandSettings interface
  return {
    id: brand.id,
    user_id: brand.user_id,
    name: brand.name,
    logo_url: (brand as any).logo_url || null,
    segment: (brand as any).segment || null,
    website: (brand as any).website || null,
    email: brand.email || null,
    phone_number: brand.phone_number || null,
    street_address: (brand as any).street_address || null,
    city: (brand as any).city || null,
    state: (brand as any).state || null,
    zip_code: (brand as any).zip_code || null,
    country: (brand as any).country || null,
    stripe_account_id: brand.stripe_account_id || null,
    created_at: brand.created_at,
    updated_at: brand.updated_at,
  } as BrandSettings;
}

/**
 * Update brand settings
 */
export async function updateBrandSettings(
  brandId: number, 
  updates: BrandSettingsUpdate
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('brands')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', brandId);

  if (error) {
    console.error('[BrandSettings] Error updating brand:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Upload brand logo image
 * @param file - The image file to upload (must be JPG or PNG, max 2MB)
 * @returns The public URL of the uploaded image, or null on error
 */
export async function uploadBrandLogo(file: File): Promise<{ url: string | null; error?: string }> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Only JPG and PNG images are allowed' };
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { url: null, error: 'Image must be smaller than 2MB' };
  }

  // Validate image dimensions
  const dimensionError = await validateImageDimensions(file);
  if (dimensionError) {
    return { url: null, error: dimensionError };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { url: null, error: 'Not authenticated' };
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('brand-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error('[BrandSettings] Upload error:', uploadError);
    return { url: null, error: 'Failed to upload image' };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('brand-logos')
    .getPublicUrl(fileName);

  return { url: publicUrl };
}

/**
 * Delete brand logo from storage
 */
export async function deleteBrandLogo(logoUrl: string): Promise<boolean> {
  if (!logoUrl) return true;

  try {
    // Extract the path from the URL
    const url = new URL(logoUrl);
    const pathParts = url.pathname.split('/brand-logos/');
    if (pathParts.length < 2) return true;

    const filePath = pathParts[1];
    
    const { error } = await supabase.storage
      .from('brand-logos')
      .remove([filePath]);

    if (error) {
      console.error('[BrandSettings] Error deleting logo:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[BrandSettings] Error parsing logo URL:', e);
    return false;
  }
}

/**
 * Validate image dimensions (recommended 400x400px, min 100x100px)
 */
function validateImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      const minSize = 100;
      const maxSize = 2000;
      
      if (img.width < minSize || img.height < minSize) {
        resolve(`Image must be at least ${minSize}x${minSize} pixels`);
        return;
      }
      
      if (img.width > maxSize || img.height > maxSize) {
        resolve(`Image must be smaller than ${maxSize}x${maxSize} pixels`);
        return;
      }
      
      resolve(null);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve('Invalid image file');
    };
    
    img.src = URL.createObjectURL(file);
  });
}

