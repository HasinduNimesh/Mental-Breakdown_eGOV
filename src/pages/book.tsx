import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OFFICES, SERVICES, getNextAvailableDate, generateSlots, formatDateISO, BookingDraft, saveBooking, generateBookingCode, buildICS } from '@/lib/booking';
import { track } from '@/lib/analytics';
import { CloudArrowUpIcon, MapPinIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/auth/SignInModal';
import QRCode from 'qrcode';

type Step = 1 | 2 | 3 | 4 | 5;

const BookPage: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = React.useState<Step>(1);
  const [serviceId, setServiceId] = React.useState(SERVICES[0].id);
  const [officeId, setOfficeId] = React.useState(OFFICES[0].id);
  const [date, setDate] = React.useState(getNextAvailableDate());
  const [time, setTime] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [nic, setNic] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [docs, setDocs] = React.useState<Array<{ file: File; status: 'Pending review' | 'Needs fix' | 'Pre-checked' }>>([]);
  const [confirmed, setConfirmed] = React.useState<BookingDraft | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [showSignIn, setShowSignIn] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const service = SERVICES.find(s => s.id === serviceId)!;
  const office = OFFICES.find(o => o.id === officeId)!;
  const slots = React.useMemo(() => generateSlots(date), [date]);
  const morning = slots.filter(s => s.period === 'morning');
  const afternoon = slots.filter(s => s.period === 'afternoon');

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

  function confirm() {
    const booking: BookingDraft = {
      id: generateBookingCode(),
      serviceId,
      officeId,
      dateISO: formatDateISO(date),
      time,
      fullName,
      nic,
      email,
      phone,
      documents: docs.map(d => ({ name: d.file.name, size: d.file.size, status: d.status })),
      createdAt: Date.now(),
      status: 'Scheduled',
    };
    saveBooking(booking);
  track('booking_completed', { serviceId, officeId, date: booking.dateISO, time: booking.time });
    setConfirmed(booking);
    setStep(5);
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
                  <label className="block text-sm font-medium text-text-900 mb-1">Service</label>
                  <select className="w-full border border-border rounded-md px-3 py-2" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                    {SERVICES.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}
                  </select>
                  <div className="mt-2 text-xs text-text-600">Department: {service.department}</div>
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
                    <div className="text-sm text-text-700 mb-2">Next available date</div>
                    <div className="flex items-center gap-2">
                      <input type="date" className="border border-border rounded-md px-3 py-2" value={formatDateISO(date)} onChange={(e) => setDate(new Date(e.target.value))} />
                      <Button variant="outline" onClick={() => setDate(getNextAvailableDate())}>Jump to next</Button>
                    </div>
                    <div className="mt-2 text-xs text-text-600">Cut-off: same-day bookings close at 3:00 PM.</div>
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
                      <Button onClick={() => { if (!user) { setShowSignIn(true); return; } setStep(3); }} disabled={!time || !user}>Enter your details</Button>
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
                <div className="md:col-span-2 flex items-center gap-3">
                  <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                  <Button onClick={() => { if (!user) { setShowSignIn(true); return; } setStep(4); }} disabled={!user || !fullName || !nic || !email || !phone}>Upload documents</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-3 text-sm text-text-700">Upload the required documents for this service.</div>
                <div className="mb-3 flex items-start gap-2 text-xs text-text-600">
                  <InformationCircleIcon className="w-4 h-4 mt-0.5 text-text-500" aria-hidden />
                  <div>
                    Accepted formats: PDF, JPG, or PNG. Max size: 10 MB per file. Up to 5 files.<br />
                    Examples: NIC front and back, birth certificate scan, passport photo. Make sure photos are clear, well-lit, and not cropped.
                  </div>
                </div>
                {uploadError && (
                  <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{uploadError}</div>
                )}
                <label className="block border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:bg-bg-50">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" multiple onChange={(e) => onFilesSelected(e.target.files)} disabled={!user} />
                  <CloudArrowUpIcon className="w-6 h-6 mx-auto text-text-400" aria-hidden />
                  <div className="mt-2 text-sm">Drop files here or click to upload</div>
                </label>
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
                  <Button onClick={proceedToReview} disabled={!user || docs.length === 0}>Review & confirm</Button>
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
                    <div className="text-sm text-text-700">Your details: {fullName} • {nic} • {email} • {phone}</div>
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
                    {!confirmed && <Button onClick={confirm}>Confirm booking</Button>}
                    {confirmed && <Button href={buildICS(confirmed, service, office)} download={`appointment-${confirmed.id}.ics`} variant="outline">Add to calendar</Button>}
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
