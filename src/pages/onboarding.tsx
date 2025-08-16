import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isNew = router.query.new === '1';

  // Form state aligned with public.profiles columns we allow
  const [fullName, setFullName] = React.useState('');
  const [nic, setNic] = React.useState('');
  const [dob, setDob] = React.useState(''); // YYYY-MM-DD (required)
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState(''); // read-only (from user)
  const [preferredLanguage, setPreferredLanguage] = React.useState('en');

  const [step, setStep] = React.useState<Step>(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Profile photo state
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [capturing, setCapturing] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [secureOk, setSecureOk] = React.useState(true);
  const [cams, setCams] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedCamId, setSelectedCamId] = React.useState<string>('');
  const [permState, setPermState] = React.useState<'prompt' | 'granted' | 'denied' | null>(null);
  const [settingsUrl, setSettingsUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSecure = window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname);
      setSecureOk(isSecure);
  // Best-effort browser settings URL
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('edg/')) setSettingsUrl('edge://settings/content/camera');
  else if (ua.includes('chrome/')) setSettingsUrl('chrome://settings/content/camera');
  else if (ua.includes('firefox/')) setSettingsUrl('about:preferences#privacy');
  else setSettingsUrl('');
    }
    return () => { stopCamera(); };
  }, []);

  async function listCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter((d) => d.kind === 'videoinput');
      setCams(vids);
      return vids;
    } catch {
      return [] as MediaDeviceInfo[];
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setPhotoFile(f);
    const url = URL.createObjectURL(f);
    setPhotoPreview(url);
  }

  async function startCamera() {
    setError(null);
    if (!secureOk) {
      setError('Camera requires HTTPS or localhost. Please use https:// or http://localhost.');
      return;
    }
    // Query permission status if supported (non-blocking)
    try {
      const perm: any = (navigator as any).permissions;
      if (perm && perm.query) {
        const st = await perm.query({ name: 'camera' as PermissionName });
        setPermState(st.state as any);
      }
    } catch {}

    // Build constraints preference order
    const tryConstraints: MediaStreamConstraints[] = [];
    if (selectedCamId) {
      tryConstraints.push({ video: { deviceId: { exact: selectedCamId } }, audio: false });
    }
    tryConstraints.push({ video: { facingMode: 'user' }, audio: false });
    tryConstraints.push({ video: { facingMode: 'environment' }, audio: false });
    tryConstraints.push({ video: true, audio: false });

    // Stop any existing stream
    stopCamera();

    let lastErr: any = null;
    for (const constraints of tryConstraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCapturing(true);
        // Refresh camera list and select current
        const vids = await listCameras();
        const active = stream.getVideoTracks()[0];
        const settings = active.getSettings ? (active.getSettings() as MediaTrackSettings) : ({} as MediaTrackSettings);
        const activeId = (settings as any).deviceId || '';
        if (!selectedCamId) {
          if (activeId) setSelectedCamId(activeId);
          else if (vids[0]) setSelectedCamId(vids[0].deviceId);
        }
        setError(null);
        return;
      } catch (err) {
        lastErr = err;
        // continue to next constraints
      }
    }
    const msg = (lastErr && (lastErr.message || lastErr.name)) || 'Camera error';
    setError('Unable to access camera. You can upload an image instead.' + (msg ? ` (${msg})` : ''));
  }
  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCapturing(false);
  }
  async function captureSnapshot() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = 640;
    const height = Math.round((video.videoHeight / video.videoWidth) * width) || 640;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/jpeg', 0.9));
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    stopCamera();
  }

  // Prefill from session and existing profile
  React.useEffect(() => {
    if (!user) return;
    setEmail(user.email || '');
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, nic, dob, phone, email, preferred_language')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || '');
        setNic(data.nic || '');
        setDob(data.dob || '');
        setPhone(data.phone || '');
        setEmail(data.email || user.email || '');
        setPreferredLanguage((data.preferred_language as any) || 'en');
        // If required fields already complete, redirect
        if (data.full_name && data.nic && data.phone) {
          router.replace('/appointments');
        }
      }
    })();
  }, [user, router]);

  // Validators
  const nicNorm = (v: string) => v.trim().toUpperCase();
  const isValidNIC = (v: string) => {
    const s = nicNorm(v);
    return /^\d{12}$/.test(s) || /^\d{9}[VX]$/.test(s);
  };
  const phoneNorm = (v: string) => v.replace(/\D/g, '');
  const isValidPhone = (v: string) => /^0\d{9}$/.test(phoneNorm(v)); // e.g., 07XXXXXXXX
  const isValidDOB = (v: string) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
  const isAdult = (v: string) => {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return true; // optional
    const d = new Date(v + 'T00:00:00Z');
    if (Number.isNaN(d.getTime())) return true;
    const now = new Date();
    const age = (now.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 16;
  };

  const step1Valid = fullName.trim().length > 1 && isValidNIC(nic) && isValidPhone(phone) && !!dob && isValidDOB(dob) && isAdult(dob);
  const step2Valid = true;

  function next() {
    setError(null);
    if (step === 1 && !step1Valid) {
      setError('Please enter a valid full name, NIC (12 digits or 9 digits + V/X), and a 10-digit phone (07XXXXXXXX).');
      return;
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }
  function back() {
    setError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function submit() {
    if (!user) return;
    if (!step1Valid || !step2Valid) {
      setError('Please fix the highlighted errors before continuing.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1) Upload photo if provided
      if (photoFile) {
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${photoFile.type.split('/')[1] || 'jpg'}`;
        const up = await supabase.storage.from('profile-photos').upload(path, photoFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: photoFile.type,
        });
        if (up.error) throw new Error(up.error.message);
        // Mark previous as not current and insert new row
        await supabase.from('profile_photos').update({ is_current: false }).eq('user_id', user.id);
        const ins = await supabase.from('profile_photos').insert({ user_id: user.id, object_key: path, is_current: true, device_info: { ua: navigator.userAgent } });
        if (ins.error) throw new Error(ins.error.message);
      }

      // 2) Upsert profile fields
  const payload = {
        full_name: fullName.trim(),
        nic: nicNorm(nic),
        dob: dob || null,
        phone: phoneNorm(phone),
        preferred_language: preferredLanguage || 'en',
      } as Record<string, unknown>;

      const { data: { session } } = await supabase.auth.getSession();
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 15000);
      const resp = await fetch('/api/profile-upsert', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      }).catch((e) => { throw new Error(e?.name === 'AbortError' ? 'Network timeout' : (e?.message || 'Network error')); });
      clearTimeout(t);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        const fallback = await supabase.functions.invoke('profile-upsert', { body: payload });
        if (fallback.error) throw new Error(fallback.error.message || text || 'Failed to save');
      }
      router.replace('/appointments');
    } catch (e: any) {
      const msg: string = e?.message ?? 'Something went wrong';
      if (/profiles_email_unique/i.test(msg)) setError('This email is already in use.');
      else if (/profiles_nic_unique/i.test(msg)) setError('This NIC is already in use.');
      else if (/profiles_phone_unique/i.test(msg)) setError('This phone number is already in use.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Head><title>Complete your profile</title></Head>
      <div className="min-h-screen bg-bg-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white border border-border rounded-lg p-5 shadow-card">
          <header className="mb-4">
            <h1 className="text-xl font-semibold">{isNew ? 'Create your account' : 'Complete your profile'}</h1>
            <p className="text-sm text-text-600">Required fields are marked with *</p>
          </header>

          {/* Step indicator */}
          <ol className="flex items-center gap-2 mb-5" aria-label="Progress">
            {['Basic details', 'Account & photo', 'Review'].map((label, i) => {
              const idx = (i + 1) as Step;
              const active = idx === step;
              const done = idx < step;
              return (
                <li key={label} className="flex-1">
                  <div className={`flex items-center gap-2 ${active ? 'text-primary-700' : done ? 'text-green-700' : 'text-text-500'}`}>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold border ${active ? 'bg-primary-50 border-primary-200' : done ? 'bg-green-50 border-green-200' : 'bg-bg-100 border-border'}`}>{i + 1}</span>
                    <span className="text-xs sm:text-sm">{label}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Steps */}
          {step === 1 && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full name *</label>
                  <input className="w-full border border-border rounded-md px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIC *</label>
                  <input className={`w-full border rounded-md px-3 py-2 ${nic && !isValidNIC(nic) ? 'border-red-300' : 'border-border'}`} value={nic} onChange={(e) => setNic(e.target.value)} placeholder="12 digits or 9 digits + V/X" />
                  {nic && !isValidNIC(nic) && <p className="text-xs text-red-600 mt-1">Invalid NIC format</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone (for reminders) *</label>
                  <input className={`w-full border rounded-md px-3 py-2 ${phone && !isValidPhone(phone) ? 'border-red-300' : 'border-border'}`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" inputMode="tel" />
                  {phone && !isValidPhone(phone) && <p className="text-xs text-red-600 mt-1">Enter a 10-digit mobile starting with 07</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of birth *</label>
                  <input type="date" className={`w-full border rounded-md px-3 py-2 ${!isValidDOB(dob) || !isAdult(dob) ? 'border-red-300' : 'border-border'}`} value={dob} onChange={(e) => setDob(e.target.value)} />
                  {!isAdult(dob) && <p className="text-xs text-red-600 mt-1">You must be at least 16 years old</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred language *</label>
                  <select className="w-full border border-border rounded-md px-3 py-2" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                </div>
              </div>
              {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mt-3">{error}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={next} disabled={!step1Valid}>Continue</Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input className="w-full border border-border rounded-md px-3 py-2 bg-bg-100 text-text-600" value={email} readOnly disabled placeholder="you@example.com" />
                  <p className="text-[11px] text-text-500 mt-1">Email is set from your sign-in and cannot be changed here.</p>
                </div>
              </div>

              {/* Verification photo */}
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Verification photo (optional)</h2>
                  {photoPreview && (
                    <button className="text-xs text-red-600 hover:underline" onClick={() => { setPhotoFile(null); if (photoPreview) URL.revokeObjectURL(photoPreview); setPhotoPreview(null); }}>Remove</button>
                  )}
                </div>
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <img src={photoPreview} alt="Selected profile" className="w-24 h-24 object-cover rounded-md border border-border" />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPhotoPreview(photoPreview)}>Preview</Button>
                      <label className="inline-flex">
                        <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
                        <span className="btn inline-flex items-center justify-center h-9 px-3 rounded-md border border-border text-sm">Choose different</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex">
                      <input type="file" accept="image/*" capture="user" className="hidden" onChange={onFileSelect} />
                      <span className="btn inline-flex items-center justify-center h-9 px-3 rounded-md border border-border text-sm">Upload image</span>
                    </label>
                    <Button variant="outline" onClick={startCamera}>Take a photo</Button>
                    {cams.length > 1 && (
                      <select
                        className="h-9 border border-border rounded-md text-sm px-2"
                        value={selectedCamId}
                        onChange={(e) => { setSelectedCamId(e.target.value); startCamera(); }}
                        title="Select camera"
                      >
                        {cams.map((c, idx) => (
                          <option key={c.deviceId || idx} value={c.deviceId}>{c.label || `Camera ${idx + 1}`}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {capturing && (
                  <div className="mt-3">
                    <div className="relative w-full max-w-sm aspect-video bg-black rounded-md overflow-hidden">
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button onClick={captureSnapshot}>Capture</Button>
                      <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-text-500 mt-2">Max 5MB. Face clearly visible. Avoid backlight.</p>
                {!secureOk && <p className="text-xs text-red-600 mt-2">Tip: Use HTTPS or http://localhost for camera access.</p>}
                {permState === 'denied' && (
                  <div className="text-xs text-red-600 mt-1">
                    <p>Camera permission is blocked. Enable camera for this site in your browser settings and try again.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={startCamera}>Try again</Button>
                      {settingsUrl && (
                        <a href={settingsUrl} target="_blank" rel="noreferrer" className="underline text-red-700">Open camera settings</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mt-3">{error}</div>}
              <div className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={next} disabled={!step2Valid}>Continue</Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <div className="border border-border rounded-md p-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className="text-text-500">Full name</span><div className="font-medium">{fullName || '-'}</div></div>
                  <div><span className="text-text-500">NIC</span><div className="font-medium">{nicNorm(nic) || '-'}</div></div>
                  <div><span className="text-text-500">Phone</span><div className="font-medium">{phoneNorm(phone) || '-'}</div></div>
                  <div><span className="text-text-500">Preferred language</span><div className="font-medium">{preferredLanguage.toUpperCase()}</div></div>
                  <div><span className="text-text-500">Email</span><div className="font-medium">{email || '-'}</div></div>
                  <div><span className="text-text-500">Date of birth</span><div className="font-medium">{dob || '-'}</div></div>
                </div>
              </div>
              {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mt-3">{error}</div>}
              <div className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Save & continue'}</Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
