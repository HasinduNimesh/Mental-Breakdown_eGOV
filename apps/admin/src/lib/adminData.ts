import { getSupabase } from './supabaseClient';

// Types aligned to db/used_schema.sql
export type BookingStatus = 'Scheduled' | 'In progress' | 'On hold' | 'Completed' | 'Cancelled' | 'No-show' | 'Delayed';

export type AdminBooking = {
  id: number;
  booking_code: string;
  user_id: string | null;
  service_id: string;
  office_id: string;
  slot_date: string; // YYYY-MM-DD
  slot_time: string; // HH:mm:ss or HH:mm
  full_name: string;
  nic: string;
  email: string;
  phone: string;
  alt_phone: string | null;
  status: BookingStatus;
  created_at: string;
};

export type AppointmentDocument = {
  id: number;
  booking_code: string;
  object_key: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  status: 'Pending review' | 'Needs fix' | 'Pre-checked';
  notes: string | null;
  uploaded_at: string;
};

// --- Bookings (admin views) ---
// Note: There is no department_id in bookings; filtering by department requires a join to services if modeled.
// For now we provide simple date range listing utilities administrators can use.
export async function listBookings(fromISO?: string, toISO?: string) {
  const supabase = getSupabase();
  let q = supabase.from('bookings').select('*').order('slot_date', { ascending: true }).order('slot_time', { ascending: true });
  if (fromISO) q = q.gte('slot_date', fromISO);
  if (toISO) q = q.lte('slot_date', toISO);
  const { data, error } = await q as any;
  if (error) throw error;
  return (data || []) as AdminBooking[];
}

export async function updateBookingStatusByCode(booking_code: string, status: BookingStatus) {
  const supabase = getSupabase();
  const { error } = await supabase.from('bookings').update({ status }).eq('booking_code', booking_code);
  if (error) throw error;
}

// --- Documents ---
export async function listBookingDocuments(booking_code: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('appointment_documents')
    .select('*')
    .eq('booking_code', booking_code)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return (data || []) as AppointmentDocument[];
}

export async function reviewBookingDocument(docId: number, nextStatus: AppointmentDocument['status'], notes?: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('appointment_documents')
    .update({ status: nextStatus, notes: notes ?? null })
    .eq('id', docId);
  if (error) throw error;
}

// --- Messaging ---
// No messages table exists in the provided schema. Consider adding one if citizen-officer messaging is required.
export type PendingMessage = { booking_code: string; to_user_id: string; from_officer_id: string; body: string };
export async function sendCitizenMessage(_: PendingMessage) {
  throw new Error('Messaging is not configured: missing messages table. See README-supabase.md for suggested schema.');
}
