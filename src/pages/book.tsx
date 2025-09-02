import React from 'react';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OFFICES, SERVICES, getNextAvailableDate, getNextBusinessDay, generateSlots, formatDateISO, BookingDraft, saveBooking, generateBookingCode, buildICS } from '@/lib/booking';
import { SERVICES_DETAILS, type ServiceDetail } from '@/lib/servicesData';
import Calendar from '@/components/booking/Calendar';
import { track } from '@/lib/analytics';
import { CloudArrowUpIcon, MapPinIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/auth/SignInModal';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { listProfileDocuments, uploadProfileDocument, type ProfileDoc } from '@/lib/documents';
import { downloadBookingPDF } from '@/lib/pdf';

type Step = 1 | 2 | 3 | 4 | 5;

const BookPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = React.useState<Step>(1);
  const [serviceId, setServiceId] = React.useState(SERVICES[0].id);
  const [serverSlotTimes, setServerSlotTimes] = React.useState<Array<{ time: string; available: boolean; period: 'morning'|'afternoon' }>>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [bookingBusy, setBookingBusy] = React.useState(false);
  const [serviceLocked, setServiceLocked] = React.useState<boolean>(true);
  const [officeId, setOfficeId] = React.useState(OFFICES[0].id);
  const [date, setDate] = React.useState(getNextAvailableDate());
  const [time, setTime] = React.useState('');
  const [monthView, setMonthView] = React.useState<Date>(getNextAvailableDate());
  const [availabilityByDate, setAvailabilityByDate] = React.useState<Record<string, number>>({});
  const [fullName, setFullName] = React.useState('');
  const [nic, setNic] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [altPhone, setAltPhone] = React.useState('');
  const [docs, setDocs] = React.useState<Array<{ file: File; status: 'Pending review' | 'Needs fix' | 'Pre-checked' }>>([]);
  // Saved profile documents support
  const [savedDocs, setSavedDocs] = React.useState<ProfileDoc[]>([]);
  const [selectedDocIds, setSelectedDocIds] = React.useState<number[]>([]);
  const [savedDocsLoading, setSavedDocsLoading] = React.useState(false);
  const [savedDocsError, setSavedDocsError] = React.useState<string | null>(null);
  const [profileUploadBusy, setProfileUploadBusy] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState<BookingDraft | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [showSignIn, setShowSignIn] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const service = SERVICES.find(s => s.id === serviceId)!;
  // Map booking serviceId -> ServiceDetail to list requirements
  const serviceDetail: ServiceDetail | undefined = React.useMemo(() => {
    const map: Record<string, string> = {
      'passport': 'passport-application',
      'license': 'driving-license',
      'birth-cert': 'birth-certificate',
      'police-clearance': 'police-clearance',
    };
    const detailId = map[serviceId] || serviceId;
    return SERVICES_DETAILS.find(d => d.id === detailId);
  }, [serviceId]);
  const office = OFFICES.find(o => o.id === officeId)!;
  const slots = React.useMemo(() => {
    // Prefer server-provided slots if available, otherwise use local generator
    if (serverSlotTimes.length) return serverSlotTimes;
    return generateSlots(date);
  }, [date, serverSlotTimes]);
  const morning = slots.filter(s => s.period === 'morning');
  const afternoon = slots.filter(s => s.period === 'afternoon');

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Load availability map for the visible month (placeholder local logic for now)
  React.useEffect(() => {
    const start = new Date(monthView.getFullYear(), monthView.getMonth(), 1);
    const end = new Date(monthView.getFullYear(), monthView.getMonth() + 1, 0);
    const next: Record<string, number> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) continue; // skip Sundays
      const k = formatDateISO(d);
      // derive from generateSlots to keep consistent until server API is added
      const count = generateSlots(d).filter(s => s.available).length;
      next[k] = count;
    }
    setAvailabilityByDate(next);
  }, [monthView]);

  // Normalize incoming service query (?service=passport-application | passport | driving-license | license | birth-cert | birth-certificate | police-clearance)
  function normalizeService(input?: string | string[]): string | null {
    if (!input) return null;
    const raw = Array.isArray(input) ? input[0] : input;
    const key = raw.toLowerCase();
    const map: Record<string, string> = {
      'passport': 'passport',
      'passport-application': 'passport',
      'driving-license': 'license',
      'license': 'license',
      'birth-cert': 'birth-cert',
      'birth-certificate': 'birth-cert',
      'police-clearance': 'police-clearance',
    };
    return map[key] ?? null;
  }

  // Set initial service based on query param and lock the selector
  React.useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = normalizeService(router.query.service);
    if (fromQuery && SERVICES.some(s => s.id === fromQuery)) {
      setServiceId(fromQuery);
      setServiceLocked(true);
    }
  }, [router.isReady, router.query.service]);

  // Try to load availability for the visible month and specific service/office via DB; fallback handled in UI
  React.useEffect(() => {
    let cancelled = false;
    async function fetchMonthAvailability() {
      const start = new Date(monthView.getFullYear(), monthView.getMonth(), 1);
      const end = new Date(monthView.getFullYear(), monthView.getMonth() + 1, 0);
      try {
        const { data, error } = await supabase
          .from('slots')
          .select('slot_date, remaining')
          .eq('service_id', serviceId)
          .eq('office_id', officeId)
          .gte('slot_date', formatDateISO(start))
          .lte('slot_date', formatDateISO(end));
        if (error || !data) {
          // ignore; we'll keep local availability map
          return;
        }
        const map: Record<string, number> = {};
        for (const row of data as any[]) {
          const day = row.slot_date as string; // YYYY-MM-DD
          map[day] = (map[day] || 0) + (row.remaining ?? 0);
        }
        if (!cancelled) setAvailabilityByDate(map);
      } catch {}
    }
    fetchMonthAvailability();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthView, serviceId, officeId]);

  // Try to load per-day slot list from DB when date/service/office changes
  React.useEffect(() => {
    let cancelled = false;
    async function fetchDaySlots() {
      setLoadingSlots(true);
      setServerSlotTimes([]);
      try {
        const { data, error } = await supabase
          .from('slots')
          .select('slot_time, remaining')
          .eq('service_id', serviceId)
          .eq('office_id', officeId)
          .eq('slot_date', formatDateISO(date))
          .order('slot_time', { ascending: true });
        if (!error && data) {
          const next = (data as any[]).map(r => {
            const t: string = (r.slot_time as string).slice(0,5); // HH:MM
            const hour = parseInt(t.slice(0,2), 10);
            const period = hour < 12 ? 'morning' : 'afternoon';
            return { time: t, available: (r.remaining ?? 0) > 0, period } as const;
          });
          if (!cancelled) setServerSlotTimes(next);
        }
      } catch {}
      finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    fetchDaySlots();
    return () => { cancelled = true; };
  }, [serviceId, officeId, date]);

  // Prefill user details from profile when signed in
  React.useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!user) return;
      try {
        setEmail(user.email ?? '');
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, nic, phone')
          .eq('id', user.id)
          .single();
        if (error) return;
        if (!cancelled && data) {
          if (data.full_name && !fullName) setFullName(data.full_name);
          if (data.nic && !nic) setNic(String(data.nic));
          if (data.phone && !phone) setPhone(String(data.phone));
        }
      } catch {}
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Load saved profile documents when user is ready and when entering step 4
  React.useEffect(() => {
    let cancelled = false;
    async function loadSaved() {
      if (!user || step !== 4) return;
      setSavedDocsLoading(true);
      setSavedDocsError(null);
      try {
        const list = await listProfileDocuments();
        if (!cancelled) setSavedDocs(list);
      } catch (e: any) {
        if (!cancelled) setSavedDocsError(e?.message || 'Failed to load saved documents');
      } finally {
        if (!cancelled) setSavedDocsLoading(false);
      }
    }
    loadSaved();
    return () => { cancelled = true; };
  }, [user?.id, step]);

  function onFilesSelected(files: FileList | null) {
    if (!files) return;
    const MAX = 10 * 1024 * 1024; // 10MB
    const accepted: File[] = [];
    for (const f of Array.from(files).slice(0, 5)) {
      if (f.size > MAX) {
        setUploadError(`"${f.name}" is larger than 10 MB. Please upload files up to 10 MB.`);
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length) {
  const next = accepted.map(f => ({ file: f, status: 'Pending review' as const }));
      setDocs(prev => [...prev, ...next]);
      setUploadError(null);
    }
  }

  function removeDoc(index: number) {
    setDocs(prev => prev.filter((_, i) => i !== index));
  }

  async function onUploadToProfile(files: FileList | null) {
    if (!files || !user) return;
    const MAX = 10 * 1024 * 1024; // 10MB
    const accepted = Array.from(files).slice(0, 8).filter(f => f.size <= MAX);
    if (!accepted.length) return;
    setProfileUploadBusy(true);
    try {
      for (const f of accepted) {
        await uploadProfileDocument(f);
      }
      const list = await listProfileDocuments();
      setSavedDocs(list);
    } catch (e: any) {
      setSavedDocsError(e?.message || 'Upload failed');
    } finally {
      setProfileUploadBusy(false);
    }
  }

  async function confirm() {
    const localBooking: BookingDraft = {
      id: generateBookingCode(),
      serviceId,
      officeId,
      dateISO: formatDateISO(date),
      time,
      fullName,
      nic,
      email,
      phone,
      altPhone: altPhone || undefined,
      documents: docs.map(d => ({ name: d.file.name, size: d.file.size, status: d.status })),
      createdAt: Date.now(),
  status: 'Scheduled',
  is_reminder_sent: false,
    };
    setBookingBusy(true);
    try {
      // Try server-side atomic booking via RPC (if schema is installed)
      const { data: rpcData, error: rpcError } = await supabase.rpc('book_appointment', {
        p_service_id: serviceId,
        p_office_id: officeId,
        p_slot_date: localBooking.dateISO,
        p_slot_time: localBooking.time,
        p_full_name: fullName,
        p_nic: nic,
        p_email: email,
        p_phone: phone,
        p_alt_phone: altPhone || null,
        p_booking_code: localBooking.id,
      });
      let bookingCode = localBooking.id;
      if (!rpcError && rpcData && (rpcData as any).booking_code) {
        bookingCode = (rpcData as any).booking_code as string;
        // Store appointment documents linked to bookingCode
        if (selectedDocIds.length) {
          try {
            const { data, error } = await supabase
              .from('profile_documents')
              .select('object_key, original_name, mime_type, size_bytes')
              .in('id', selectedDocIds);
            if (!error && data && data.length) {
              const rows = data.map((d: any) => ({
                booking_code: bookingCode,
                object_key: d.object_key,
                original_name: d.original_name,
                mime_type: d.mime_type,
                size_bytes: d.size_bytes,
                status: 'Pending review' as const,
              }));
              await supabase.from('appointment_documents').insert(rows);
            }
          } catch {}
        }
        // Persist QR payload details into DB (image generated client-side here)
        try {
          const payload = { id: bookingCode, serviceId, officeId, date: localBooking.dateISO, time: localBooking.time };
          const url = await QRCode.toDataURL(JSON.stringify(payload), { width: 240, margin: 1, color: { dark: '#1f2937', light: '#ffffff' }, errorCorrectionLevel: 'M' });
          await supabase.from('bookings').update({ qr_payload: payload as any, qr_data_url: url }).eq('booking_code', bookingCode);
          setQrDataUrl(url);
        } catch {}
        const confirmed: BookingDraft = { ...localBooking, id: bookingCode };
        track('booking_completed', { serviceId, officeId, date: confirmed.dateISO, time: confirmed.time });
        setConfirmed(confirmed);
        setStep(5);
        return;
      }
      // Fallback to local-only booking if RPC not available
      saveBooking(localBooking);
      // Attach selected saved profile docs to this booking for officials (local booking still stores appointment_documents if table exists)
      if (selectedDocIds.length) {
        try {
          const { data, error } = await supabase
            .from('profile_documents')
            .select('object_key, original_name, mime_type, size_bytes')
            .in('id', selectedDocIds);
          if (!error && data && data.length) {
            const rows = data.map((d: any) => ({
              booking_code: localBooking.id,
              object_key: d.object_key,
              original_name: d.original_name,
              mime_type: d.mime_type,
              size_bytes: d.size_bytes,
              status: 'Pending review' as const,
            }));
            await supabase.from('appointment_documents').insert(rows);
          }
        } catch {}
      }
      track('booking_completed', { serviceId, officeId, date: localBooking.dateISO, time: localBooking.time });
      setConfirmed(localBooking);
      setStep(5);
    } finally {
      setBookingBusy(false);
    }
  }

  // Generate QR after confirmation on client only
  React.useEffect(() => {
    let cancelled = false;
    async function makeQR() {
      if (!confirmed) {
        setQrDataUrl(null);
        return;
      }
      try {
        const payload = JSON.stringify({
          id: confirmed.id,
          serviceId: confirmed.serviceId,
          officeId: confirmed.officeId,
          date: confirmed.dateISO,
          time: confirmed.time,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 240,
          margin: 1,
          color: { dark: '#1f2937', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    }
    makeQR();
    return () => { cancelled = true; };
  }, [confirmed]);

  function proceedToReview() {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    setStep(5);
  }

  return (
    <>
    <Layout>
      <section className="bg-white">
        <Container className="py-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Book Appointment' }]} />
        </Container>
      </section>

      <section className="py-8 sm:py-12 bg-bg-50">
        <Container>
          <Card className="p-4 sm:p-6">
            {/* Stepper */}
      <ol className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
              {[
        'Choose office and service',
        'Pick date and time',
        'Enter your details',
        'Upload documents',
        'Review and confirm',
              ].map((label, idx) => {
                const s = (idx + 1) as Step;
                return (
                  <li key={label} className={`flex items-center gap-2 ${step === s ? 'text-primary-700' : 'text-text-600'}`}>
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border ${step >= s ? 'bg-primary-600 text-white border-primary-600' : 'border-border'}`}>{idx + 1}</span>
                    <span className="text-sm whitespace-nowrap">{label}</span>
                    {idx < 4 && <span className="hidden sm:block w-8 h-px bg-border ml-2" />}
                  </li>
                );
              })}
            </ol>

            {/* Step content */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-text-900">Service</label>
                    <label className="inline-flex items-center gap-2 text-xs text-text-600">
                      <input type="checkbox" checked={!serviceLocked} onChange={(e) => setServiceLocked(!e.target.checked)} />
                      Allow changing
                    </label>
                  </div>
                  <select className="w-full border border-border rounded-md px-3 py-2" value={serviceId} onChange={(e) => setServiceId(e.target.value)} disabled={serviceLocked}>
                    {SERVICES.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}
                  </select>
                  <div className="mt-2 text-xs text-text-600">Department: {service.department}{serviceLocked && ' • locked from previous selection'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-900 mb-1">Office</label>
                  <select className="w-full border border-border rounded-md px-3 py-2" value={officeId} onChange={(e) => setOfficeId(e.target.value)}>
                    {OFFICES.map(o => (<option key={o.id} value={o.id}>{o.name} — {o.city}</option>))}
                  </select>
                  <div className="mt-2 text-xs text-text-600 flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> Local timezone: {tz}</div>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={() => { if (!user) { setShowSignIn(true); return; } setStep(2); track('booking_started', { serviceId, officeId }); }} className="mt-2" disabled={!user}>Pick date and time</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar */}
                  <div className="lg:col-span-1">
                    <div className="text-sm text-text-700 mb-2">Pick a date</div>
                    <Calendar
                      month={monthView}
                      selectedDate={date}
                      onMonthChange={(m) => setMonthView(m)}
                      onSelectDate={(d) => { setDate(d); setTime(''); }}
                      availabilityByDate={availabilityByDate}
                      minDate={getNextAvailableDate()}
                      disableWeekdays={[0]}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setDate(getNextBusinessDay(date)); setTime(''); }}>Jump to next</Button>
                      <span className="text-xs text-text-600">Cut-off: same-day bookings close at 3:00 PM.</span>
                    </div>
                  </div>
                  {/* Timeslots */}
                  <div className="lg:col-span-2">
                    <div className="text-sm font-medium text-text-900 mb-2">Time slots</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-text-600 mb-2">Morning</div>
                        <div className="flex flex-wrap gap-2">
                          {morning.map((s, i) => (
                            <button key={i} disabled={!s.available || !user} onClick={() => setTime(s.time)} className={`px-3 py-2 rounded-md border ${time === s.time ? 'border-primary-600 text-primary-700' : 'border-border text-text-700'} ${!s.available || !user ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary-300'}`}>
                              {s.time}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-600 mb-2">Afternoon</div>
                        <div className="flex flex-wrap gap-2">
                          {afternoon.map((s, i) => (
                            <button key={i} disabled={!s.available || !user} onClick={() => setTime(s.time)} className={`px-3 py-2 rounded-md border ${time === s.time ? 'border-primary-600 text-primary-700' : 'border-border text-text-700'} ${!s.available || !user ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary-300'}`}>
                              {s.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                      {/* Do not block progression on loadingSlots; network hiccups shouldn't freeze the flow once a time is chosen */}
                      <Button onClick={() => { if (!user) { setShowSignIn(true); return; } setStep(3); }} disabled={!time}>Enter your details</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-900 mb-1">Full name</label>
                  <input className="w-full border border-border rounded-md px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!user} />
                  <p className="mt-1 text-xs text-text-600">Use the name on your ID.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-900 mb-1">NIC</label>
                  <input className="w-full border border-border rounded-md px-3 py-2" value={nic} onChange={(e) => setNic(e.target.value)} disabled={!user} />
                  <p className="mt-1 text-xs text-text-600">Use the 12-digit format if available.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-900 mb-1">Email</label>
                  <input type="email" className="w-full border border-border rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!user} />
                  <p className="mt-1 text-xs text-text-600">We’ll send your confirmation to this email.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-900 mb-1">Phone</label>
                  <input className="w-full border border-border rounded-md px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!user} />
                  <p className="mt-1 text-xs text-text-600">Use a number we can reach you on if we need more info.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-900 mb-1">Alternate phone (optional)</label>
                  <input className="w-full border border-border rounded-md px-3 py-2" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} disabled={!user} />
                  <p className="mt-1 text-xs text-text-600">Provide another number if you prefer to be contacted differently.</p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                  <Button onClick={() => { if (!user) { setShowSignIn(true); return; } setStep(4); }} disabled={!user || !fullName || !nic || !email || !phone}>Upload documents</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-3 text-sm text-text-700">Upload the required documents for this service or choose from your saved documents.</div>
                {/* Required documents for this service */}
                {serviceDetail?.requirements?.length ? (
                  <div className="mb-4">
                    <div className="font-medium text-text-900 mb-2">Required for {service.title}</div>
                    <ul className="list-disc pl-5 text-sm text-text-700 space-y-1">
                      {serviceDetail.requirements.map((r, i) => (
                        <li key={i}><span className="font-medium">{r.label}</span>{r.example ? <span className="text-text-600"> — {r.example}</span> : null}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="mb-3 flex items-start gap-2 text-xs text-text-600">
                  <InformationCircleIcon className="w-4 h-4 mt-0.5 text-text-500" aria-hidden />
                  <div>
                    Accepted formats: PDF, JPG, or PNG. Max size: 10 MB per file. Up to 5 files.<br />
                    Examples: NIC front and back, birth certificate scan, passport photo. Make sure photos are clear, well-lit, and not cropped.
                  </div>
                </div>
                {/* Saved documents selector */}
                <div className="mb-4">
                  <div className="font-medium text-text-900 mb-2">Your saved documents</div>
                  {savedDocsLoading ? (
                    <div className="text-xs text-text-600">Loading…</div>
                  ) : savedDocsError ? (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{savedDocsError}</div>
                  ) : (
                    <div className="space-y-3">
                      {/* NIC group */}
                      <div className="border border-border rounded-md bg-white">
                        <div className="px-3 py-2 bg-bg-50 border-b border-border text-sm font-medium">National Identity Card (NIC)</div>
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(() => {
                            const nicFront = savedDocs.find(d => d.doc_type === 'nic-front');
                            const nicBack = savedDocs.find(d => d.doc_type === 'nic-back');
                            return (
                              <>
                                <div className="border border-border rounded p-2">
                                  <div className="text-xs text-text-600 mb-1">Front side</div>
                                  {nicFront ? (
                                    <label className="flex items-center gap-2 text-sm">
                                      <input type="checkbox" checked={selectedDocIds.includes(nicFront.id)} onChange={(e)=> setSelectedDocIds(prev=> e.target.checked ? [...prev, nicFront.id] : prev.filter(id=>id!==nicFront.id))} />
                                      <span className="truncate">{nicFront.label || nicFront.original_name || 'NIC (front)'}</span>
                                    </label>
                                  ) : (
                                    <div className="text-xs italic text-text-500">Not uploaded</div>
                                  )}
                                </div>
                                <div className="border border-border rounded p-2">
                                  <div className="text-xs text-text-600 mb-1">Back side</div>
                                  {nicBack ? (
                                    <label className="flex items-center gap-2 text-sm">
                                      <input type="checkbox" checked={selectedDocIds.includes(nicBack.id)} onChange={(e)=> setSelectedDocIds(prev=> e.target.checked ? [...prev, nicBack.id] : prev.filter(id=>id!==nicBack.id))} />
                                      <span className="truncate">{nicBack.label || nicBack.original_name || 'NIC (back)'}</span>
                                    </label>
                                  ) : (
                                    <div className="text-xs italic text-text-500">Not uploaded</div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      {/* Passport group (only show if available) */}
                      {(() => {
                        const pass = savedDocs.find(d => d.doc_type === 'passport');
                        if (!pass) return null;
                        return (
                          <div className="border border-border rounded-md bg-white">
                            <div className="px-3 py-2 bg-bg-50 border-b border-border text-sm font-medium">Passport</div>
                            <div className="p-3">
                              <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={selectedDocIds.includes(pass.id)} onChange={(e)=> setSelectedDocIds(prev=> e.target.checked ? [...prev, pass.id] : prev.filter(id=>id!==pass.id))} />
                                <span className="truncate">{pass.label || pass.original_name || 'Passport'}</span>
                              </label>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Others */}
                      <div className="border border-border rounded-md bg-white">
                        <div className="px-3 py-2 bg-bg-50 border-b border-border text-sm font-medium">Other saved documents</div>
                        <div className="p-3 space-y-2">
                          {(() => {
                            const others = savedDocs.filter(d => d.doc_type !== 'nic-front' && d.doc_type !== 'nic-back' && d.doc_type !== 'passport');
                            if (!others.length) return <div className="text-xs italic text-text-500">No other documents</div>;
                            return (
                              <ul className="space-y-2">
                                {others.map(doc => (
                                  <li key={doc.id} className="flex items-center justify-between gap-3">
                                    <label className="flex items-center gap-2 text-sm text-text-800">
                                      <input type="checkbox" checked={selectedDocIds.includes(doc.id)} onChange={(e)=> setSelectedDocIds(prev=> e.target.checked ? [...prev, doc.id] : prev.filter(id=>id!==doc.id))} />
                                      <span className="truncate max-w-[60ch]">{doc.label || doc.original_name || 'Document'}</span>
                                    </label>
                                    <span className="text-[11px] text-text-500">{doc.doc_type || 'other'} • {Math.round(((doc.size_bytes||0)/1024))} KB</span>
                                  </li>
                                ))}
                              </ul>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Helper text between saved docs and upload */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-text-900 mb-1">Upload here</div>
                  <div className="text-xs text-text-600">If you don’t see your document above, you can add files below just for this booking.</div>
                </div>
                {uploadError && (
                  <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{uploadError}</div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <label className="block border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:bg-bg-50">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" multiple onChange={(e) => onFilesSelected(e.target.files)} disabled={!user} />
                    <CloudArrowUpIcon className="w-6 h-6 mx-auto text-text-400" aria-hidden />
                    <div className="mt-2 text-sm">Attach just for this booking</div>
                    <div className="mt-1 text-xs text-text-600">These files won't be saved to your profile.</div>
                  </label>
                </div>
                <div className="mt-3 text-xs text-text-600">
                  Status guide: <span className="font-medium">Pending review</span> (we’re checking), <span className="font-medium">Needs fix</span> (please re-upload clearer or correct file), <span className="font-medium">Pre-checked</span> (looks good).
                </div>
                <ul className="mt-4 space-y-3">
                  {docs.map((d, i) => (
                    <li key={i} className="p-3 border border-border rounded-md flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-text-900 truncate">{d.file.name}</div>
                        <div className="text-xs text-text-600">{Math.round(d.file.size/1024)} KB</div>
                      </div>
                      <Badge tone={d.status === 'Pre-checked' ? 'success' : d.status === 'Needs fix' ? 'danger' : 'neutral'}>{d.status}</Badge>
                      <div className="w-32 h-2 bg-bg-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-primary-500 w-full animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                         <Button size="sm" variant="outline" onClick={() => removeDoc(i)}>Remove</Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-3">
                  <Button onClick={() => setStep(3)} variant="outline">Back</Button>
                  <Button onClick={proceedToReview} disabled={!user || (docs.length === 0 && selectedDocIds.length === 0)}>Review & confirm</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="p-4">
                    <div className="font-semibold text-text-900 mb-2">Appointment summary</div>
                    <div className="text-sm text-text-700">Service: {service.title}</div>
                    <div className="text-sm text-text-700">Department: {service.department}</div>
                    <div className="text-sm text-text-700">Office: {office.name}, {office.city}</div>
                    <div className="text-sm text-text-700">Date & time: {formatDateISO(date)} at {time} ({tz})</div>
                    <div className="text-sm text-text-700">Your details: {fullName} • {nic} • {email} • {phone}{altPhone ? ` • Alt: ${altPhone}` : ''}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="font-semibold text-text-900 mb-2">Reschedule and cancel policy</div>
                    <ul className="list-disc pl-5 text-sm text-text-700 space-y-1">
                      <li>You can reschedule or cancel for free up to 24 hours before your time.</li>
                      <li>Within 24 hours, you may need to book a new slot.</li>
                      <li>If you’re more than 15 minutes late, your slot may be released.</li>
                      <li>Bring original documents to your visit. Some services need photocopies too.</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <div className="font-semibold text-text-900 mb-2">Required documents reminder</div>
                    <ul className="list-disc pl-5 text-sm text-text-700">
                      {docs.map((d, i) => (<li key={i}>{d.file.name}</li>))}
                    </ul>
                  </Card>
          <div className="flex items-center gap-3">
            {!confirmed && <Button onClick={confirm} disabled={bookingBusy}>{bookingBusy ? 'Confirming…' : 'Confirm booking'}</Button>}
                    {confirmed && (
                      <>
                        <Button href={buildICS(confirmed, service, office)} download={`appointment-${confirmed.id}.ics`} variant="outline">Add to calendar</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!confirmed) return;
                            downloadBookingPDF({
                              booking: confirmed,
                              service,
                              office,
                              tz,
                              qrDataUrl,
                            });
                          }}
                        >
                          Download PDF
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <Card className="p-4 text-center">
                    <div className="text-sm text-text-600">Booking code</div>
                    <div className="text-2xl font-bold text-text-900">{confirmed?.id ?? 'Pending'}</div>
                    <div className="my-4 flex items-center justify-center">
                      {confirmed ? (
                        qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR code for booking ${confirmed.id}`}
                            className="w-40 h-40 rounded-md border border-border bg-white p-1"
                          />
                        ) : (
                          <div className="w-40 h-40 grid place-items-center rounded-md border border-border bg-bg-50 text-xs text-text-500">
                            Generating QR…
                          </div>
                        )
                      ) : (
                        <div className="w-40 h-40 grid place-items-center rounded-md border border-border bg-bg-50 text-xs text-text-500">
                          Confirm to generate QR
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={() => {
                        const reason = window.prompt('Why are you rescheduling? (optional)') || '';
                        track('reschedule_reason', { reason, serviceId });
                      }}>Reschedule</Button>
                      <Button variant="outline" onClick={() => {
                        const reason = window.prompt('Why are you canceling? (optional)') || '';
                        track('cancel_reason', { reason, serviceId });
                      }}>Cancel</Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>
        </Container>
      </section>
  </Layout>
  <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} context="review" emailPrefill={email} afterSignIn={() => setStep(5)} />
  </>
  );
};

export default BookPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
