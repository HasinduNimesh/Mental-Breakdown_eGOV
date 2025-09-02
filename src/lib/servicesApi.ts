import { supabase } from './supabaseClient';

export type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  category: string;
  is_online: boolean;
  processing_time_days_min: number | null;
  processing_time_days_max: number | null;
  fee_min: number | null;
  fee_max: number | null;
  popularity: 'high' | 'medium' | 'low';
  default_location: string | null;
  updated_at: string;
  department: string | null;
};

export async function fetchServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, slug, title, short_description, category, is_online, processing_time_days_min, processing_time_days_max, fee_min, fee_max, popularity, default_location, updated_at, departments(name)')
    .order('popularity', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) {
    // Surface specific permission error so callers can handle gracefully
    (error as any).handled = true;
    throw error;
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    short_description: row.short_description,
    category: row.category,
    is_online: row.is_online,
    processing_time_days_min: row.processing_time_days_min,
    processing_time_days_max: row.processing_time_days_max,
    fee_min: row.fee_min,
    fee_max: row.fee_max,
    popularity: row.popularity,
    default_location: row.default_location,
    updated_at: row.updated_at,
    department: row.departments?.name ?? null,
  }));
}
