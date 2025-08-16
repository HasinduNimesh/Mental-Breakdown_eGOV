import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isNew = router.query.new === '1';

  // If redirected here without an authenticated session (e.g., sign-up requires email confirmation),
  // show a friendly prompt instead of rendering an empty flow.
  if (!user) {
    return (
      <>
        <Head>
          <title>Complete your account - Onboarding</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="min-h-screen bg-bg-100">
          <Container className="max-w-lg py-12 sm:py-16">
            <div className="bg-white border border-border rounded-lg shadow-card p-6 sm:p-8 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-text-900 mb-2">Confirm your email</h1>
              <p className="text-sm text-text-700 mb-6">Please confirm your email address using the link we sent, then sign in to continue onboarding.</p>
              <Button href="/signin" className="w-full h-12 text-base">Go to sign in</Button>
            </div>
          </Container>
        </div>
      </>
    );
  }

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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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
      <Head>
        <title>Complete Profile - Sri Lanka Citizen Services</title>
        <meta name="description" content="Complete your profile to access Sri Lankan government services online" />
      </Head>
      
      {/* Header with branding */}
      <div className="bg-white border-b border-border">
        <Container className="max-w-[1200px] px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Sri Lanka Coat of Arms" className="h-9 w-auto" />
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-[#163B8F]">Government of Sri Lanka</div>
                <div className="text-[12px] font-medium text-[#4B5563]">Citizen Services Portal</div>
              </div>
            </Link>
            <div className="text-sm text-text-600">
              Step {step} of 3
            </div>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <div className="min-h-screen bg-bg-100">
        <Container className="max-w-3xl py-8 sm:py-12">
          <div className="bg-white border border-border rounded-lg shadow-card overflow-hidden">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 sm:p-8">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {isNew ? 'Welcome to Citizen Services' : 'Complete Your Profile'}
                </h1>
                <p className="text-blue-100 text-sm">
                  {isNew ? 'Let\'s set up your account to access government services' : 'Update your profile information'}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-4 text-sm">
                {['Basic Details', 'Verification', 'Review'].map((label, i) => {
                  const idx = (i + 1) as Step;
                  const active = idx === step;
                  const done = idx < step;
                  return (
                    <React.Fragment key={label}>
                      <div className={`flex items-center gap-2 ${active ? 'text-white' : done ? 'text-blue-200' : 'text-blue-300'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          active ? 'bg-white text-blue-900' : done ? 'bg-blue-600' : 'bg-blue-700'
                        }`}>
                          {done ? <CheckCircleIcon className="w-4 h-4" /> : idx}
                        </div>
                        <span className="hidden sm:inline">{label}</span>
                      </div>
                      {i < 2 && <div className="flex-1 h-px bg-blue-700 min-w-8"></div>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Form content */}
            <div className="p-6 sm:p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Personal Information</h2>
                    <p className="text-sm text-text-600">Please provide your basic details. Required fields are marked with *</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-text-700 mb-2">Full name *</label>
                      <input
                        type="text"
                        className="w-full border border-border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your full name as per NIC"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-700 mb-2">NIC number *</label>
                      <input
                        type="text"
                        className={`w-full border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${nic && !isValidNIC(nic) ? 'border-red-300' : 'border-border'}`}
                        placeholder="200012345678 or 200012345V"
                        value={nic}
                        onChange={e => setNic(e.target.value)}
                        required
                      />
                      {nic && !isValidNIC(nic) && (
                        <p className="text-xs text-red-600 mt-1">Please enter a valid NIC (12 digits or 9 digits + V/X)</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-700 mb-2">Phone (for reminders) *</label>
                      <input
                        type="tel"
                        inputMode="tel"
                        className={`w-full border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${phone && !isValidPhone(phone) ? 'border-red-300' : 'border-border'}`}
                        placeholder="07XXXXXXXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                      {phone && !isValidPhone(phone) && (
                        <p className="text-xs text-red-600 mt-1">Enter a 10-digit mobile starting with 07</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-700 mb-2">Date of birth *</label>
                      <input
                        type="date"
                        className={`w-full border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!isValidDOB(dob) || !isAdult(dob) ? 'border-red-300' : 'border-border'}`}
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        required
                      />
                      {!isAdult(dob) && (
                        <p className="text-xs text-red-600 mt-1">You must be at least 16 years old</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-700 mb-2">Preferred language *</label>
                      <select
                        className="w-full border border-border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={preferredLanguage}
                        onChange={e => setPreferredLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="si">සිංහල</option>
                        <option value="ta">தமிழ்</option>
                      </select>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button onClick={next} disabled={!step1Valid} className="px-8">
                      Continue to verification
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Account Verification</h2>
                    <p className="text-sm text-text-600">Verify your email and optionally add a profile photo for enhanced security</p>
                  </div>

                  {/* Email verification */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-blue-900 mb-1">Email Verified</h3>
                        <p className="text-sm text-blue-700 mb-2">Your email <span className="font-medium">{email}</span> has been verified</p>
                        <p className="text-xs text-blue-600">This email will be used for service notifications and account recovery</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile photo section */}
                  <div className="border border-border rounded-lg p-6">
                    {/* shared hidden input for uploads */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={onFileSelect}
                    />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CameraIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-900">Profile Photo</h3>
                          <p className="text-sm text-text-600">Optional verification photo</p>
                        </div>
                      </div>
                      {photoPreview && (
                        <button 
                          className="text-sm text-red-600 hover:text-red-700 hover:underline" 
                          onClick={() => { 
                            setPhotoFile(null); 
                            if (photoPreview) URL.revokeObjectURL(photoPreview); 
                            setPhotoPreview(null); 
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {photoPreview ? (
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <img src={photoPreview} alt="Selected profile" className="w-32 h-32 object-cover rounded-lg border border-border" />
                        <div className="space-y-3">
                          <p className="text-sm text-text-600">Photo uploaded successfully</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Choose different
                            </Button>
                            <Button variant="outline" size="sm" onClick={startCamera}>
                              Take new photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                        <CameraIcon className="w-12 h-12 text-text-400 mx-auto mb-3" />
                        <h4 className="font-medium text-text-900 mb-2">Add a verification photo</h4>
                        <p className="text-sm text-text-600 mb-4">This helps us verify your identity for enhanced security</p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Upload from device
                          </Button>
                          <Button variant="outline" onClick={startCamera}>
                            Take photo
                          </Button>
                        </div>
                        {cams.length > 1 && (
                          <div className="mt-3">
                            <select
                              className="border border-border rounded-md text-sm px-3 py-2"
                              value={selectedCamId}
                              onChange={(e) => { setSelectedCamId(e.target.value); startCamera(); }}
                              title="Select camera"
                            >
                              <option value="">Default camera</option>
                              {cams.map((c, idx) => (
                                <option key={c.deviceId || idx} value={c.deviceId}>
                                  {c.label || `Camera ${idx + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {capturing && (
                      <div className="mt-4 p-4 bg-bg-50 rounded-lg">
                        <div className="flex flex-col items-center">
                          <div className="relative w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden mb-3">
                            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={captureSnapshot}>Capture Photo</Button>
                            <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-text-500">
                      <p>• Maximum file size: 5MB</p>
                      <p>• Ensure your face is clearly visible</p>
                      <p>• Avoid backlighting or shadows</p>
                    </div>

                    {!secureOk && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-700">Camera requires HTTPS or localhost for security</p>
                      </div>
                    )}

                    {permState === 'denied' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700 mb-2">Camera permission is blocked. Please enable camera access in your browser settings.</p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={startCamera}>Try again</Button>
                          {settingsUrl && (
                            <a 
                              href={settingsUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-sm text-red-600 hover:text-red-700 underline"
                            >
                              Open camera settings
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={back} className="px-8">
                      Back
                    </Button>
                    <Button onClick={next} disabled={!step2Valid} className="px-8">
                      Continue to review
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Review Your Information</h2>
                    <p className="text-sm text-text-600">Please review your details before completing registration</p>
                  </div>

                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-medium text-text-900 mb-4">Personal Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-sm text-text-500">Full name</span>
                        <div className="font-medium text-text-900">{fullName || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-text-500">NIC number</span>
                        <div className="font-medium text-text-900">{nicNorm(nic) || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-text-500">Date of birth</span>
                        <div className="font-medium text-text-900">{dob || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-text-500">Phone number</span>
                        <div className="font-medium text-text-900">{phoneNorm(phone) || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-text-500">Email address</span>
                        <div className="font-medium text-text-900">{email || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-text-500">Preferred language</span>
                        <div className="font-medium text-text-900">
                          {preferredLanguage === 'en' ? 'English' : 
                           preferredLanguage === 'si' ? 'සිංහල' : 
                           preferredLanguage === 'ta' ? 'தமிழ்' : preferredLanguage.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {photoPreview && (
                    <div className="border border-border rounded-lg p-6">
                      <h3 className="font-medium text-text-900 mb-4">Profile Photo</h3>
                      <div className="flex items-center gap-4">
                        <img src={photoPreview} alt="Profile preview" className="w-20 h-20 object-cover rounded-lg border border-border" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-text-900">Verification photo uploaded</p>
                          <p className="text-sm text-text-600">This photo will help verify your identity</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Ready to Complete Registration</p>
                        <p className="text-blue-700">
                          By continuing, you agree to create your citizen services account with the information provided. 
                          You can update most details later from your profile settings.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={back} className="px-8">
                      Back to edit
                    </Button>
                    <Button onClick={submit} disabled={loading} className="px-8">
                      {loading ? 'Creating account...' : 'Complete registration'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-text-600">
              <Link href="/help" className="hover:text-primary-700">Help Center</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-primary-700">Contact Support</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary-700">Privacy Policy</Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
