export type Office = { id: string; name: string; city: string; timezone: string };
export type ServiceOption = { id: string; title: string; department: string };
export type TimeSlot = { time: string; period: 'morning' | 'afternoon'; available: boolean };

export const OFFICES: Office[] = [
  { id: 'col-hq', name: 'Head Office', city: 'Colombo', timezone: 'Asia/Colombo' },
  { id: 'mat-reg', name: 'Regional Office', city: 'Matara', timezone: 'Asia/Colombo' },
  { id: 'kan-reg', name: 'Regional Office', city: 'Kandy', timezone: 'Asia/Colombo' },
];

export const SERVICES: ServiceOption[] = [
  { id: 'passport', title: 'Passport Application', department: 'Department of Immigration & Emigration' },
  { id: 'license', title: 'Driving License Services', department: 'Department of Motor Traffic' },
  { id: 'birth-cert', title: 'Birth Certificate', department: 'Registrar General Department' },
  { id: 'police-clearance', title: 'Police Clearance Certificate', department: 'Sri Lanka Police' },
];

export function getNextAvailableDate(from = new Date()): Date {
  const d = new Date(from);
  // Next business day if current time is past 3pm cutoff
  const cutoffHour = 15;
  if (d.getHours() >= cutoffHour) d.setDate(d.getDate() + 1);
  // Skip Sunday (0)
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function generateSlots(date: Date): TimeSlot[] {
  // simple deterministic availability hash by date
  const seed = date.getDate() + date.getMonth();
  const morning = ['09:00', '09:30', '10:00', '10:30', '11:00'];
  const afternoon = ['13:30', '14:00', '14:30', '15:00'];
  return [
    ...morning.map((t, i) => ({ time: t, period: 'morning' as const, available: (seed + i) % 3 !== 0 })),
    ...afternoon.map((t, i) => ({ time: t, period: 'afternoon' as const, available: (seed + i) % 4 !== 0 })),
  ];
}

export function formatDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type BookingDraft = {
  id: string; // booking code
  serviceId: string;
  officeId: string;
  dateISO: string;
  time: string;
  fullName: string;
  nic: string;
  email: string;
  phone: string;
  documents: Array<{ name: string; size: number; status: 'Pending review' | 'Needs fix' | 'Pre-checked' }>;
  createdAt: number;
  status: 'Scheduled' | 'Checked-in' | 'Completed' | 'Cancelled';
};

const KEY = 'egov_bookings_v1';

export function saveBooking(b: BookingDraft) {
  const list = getBookings();
  const next = [b, ...list];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getBookings(): BookingDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BookingDraft[]) : [];
  } catch {
    return [];
  }
}

export function generateBookingCode(): string {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  const n = String(Date.now()).slice(-4);
  return `SL-${s}${n}`;
}

export function buildICS(b: BookingDraft, service: ServiceOption, office: Office) {
  const dt = new Date(`${b.dateISO}T${b.time}:00+05:30`);
  const dtStart = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEndDate = new Date(dt.getTime() + 30 * 60 * 1000);
  const dtEnd = dtEndDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EGov//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${b.id}@egov.lk`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${service.title} - Appointment (${b.id})`,
    `DESCRIPTION:Department: ${service.department}\\nOffice: ${office.name}, ${office.city}\\nBooking: ${b.id}`,
    `LOCATION:${office.name}, ${office.city}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);
}
