import React from 'react';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/auth/SignInModal';
import { listProfileDocuments, uploadProfileDocument, removeProfileDocument, type ProfileDoc } from '@/lib/documents';
import { supabase } from '@/lib/supabaseClient';
import { 
  CameraIcon, 
  DocumentTextIcon, 
  IdentificationIcon, 
  PhotoIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Profile documents manager page

const DocumentsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSignIn, setShowSignIn] = React.useState(false);
  // Profile docs state
  const [savedDocs, setSavedDocs] = React.useState<ProfileDoc[]>([]);
  const [savedLoading, setSavedLoading] = React.useState(false);
  const [savedError, setSavedError] = React.useState('');
  type ModalKind = 'nic' | 'passport' | 'custom' | null;
  const [modal, setModal] = React.useState<ModalKind>(null);
  const [nicFront, setNicFront] = React.useState<File | null>(null);
  const [nicBack, setNicBack] = React.useState<File | null>(null);
  const [passportFile, setPassportFile] = React.useState<File | null>(null);
  const [customFiles, setCustomFiles] = React.useState<File[]>([]);
  const [customLabel, setCustomLabel] = React.useState('');
  const [profileBusy, setProfileBusy] = React.useState(false);
  const [thumbs, setThumbs] = React.useState<Record<number, string | null>>({});
  // Camera capture state
  type CaptureTarget = 'nic-front' | 'nic-back' | 'passport' | 'custom';
  const [cameraTarget, setCameraTarget] = React.useState<CaptureTarget | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);

  React.useEffect(() => {
    if (!cameraTarget) return;
    // Start camera when target is set (client only)
    const start = async () => {
      try {
        // Some desktop browsers block this on http; works best on https or localhost
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setMediaStream(s);
        if (videoRef.current) {
          (videoRef.current as any).srcObject = s;
          videoRef.current.play().catch(() => {/* ignore */});
        }
      } catch (e) {
        alert('Unable to access camera on this device or browser.');
        setCameraTarget(null);
      }
    };
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      start();
    }
    return () => {
      // Cleanup handled by closeCamera
    };
  }, [cameraTarget]);

  const closeCamera = React.useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
    setMediaStream(null);
    setCameraTarget(null);
  }, [mediaStream]);

  const capturePhoto = React.useCallback(async () => {
    const video = videoRef.current;
    if (!video || !cameraTarget) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', 0.92));
    if (!blob) return;
    const name = cameraTarget === 'nic-front' ? 'nic-front.jpg' : cameraTarget === 'nic-back' ? 'nic-back.jpg' : cameraTarget === 'passport' ? 'passport.jpg' : 'document.jpg';
    const file = new File([blob], name, { type: 'image/jpeg' });
    if (cameraTarget === 'nic-front') setNicFront(file);
    if (cameraTarget === 'nic-back') setNicBack(file);
    if (cameraTarget === 'passport') setPassportFile(file);
    if (cameraTarget === 'custom') setCustomFiles(prev => [...prev, file]);
    closeCamera();
  }, [cameraTarget, closeCamera]);
  // No appointment uploads here anymore

  React.useEffect(() => {
    if (loading) return;
  if (!user) { setShowSignIn(true); return; }
    // Load profile docs
    (async () => {
      try {
        setSavedLoading(true);
        setSavedError('');
        const docs = await listProfileDocuments();
        setSavedDocs(docs);
      } catch (e: any) {
        setSavedError(e?.message || 'Failed to load your documents');
      } finally {
        setSavedLoading(false);
      }
    })();
  }, [user, loading]);

  // Build previews for images using authenticated download -> object URLs (more reliable than signed URLs on some setups)
  React.useEffect(() => {
    let cancelled = false;
    const urlsToRevoke: string[] = [];
    async function buildThumbs() {
      const next: Record<number, string | null> = {};
    for (const d of savedDocs) {
        if (cancelled) break;
        try {
      const nameForCheck = (d.original_name || d.object_key || '').toLowerCase();
      const looksLikeImageByExt = /(\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i.test(nameForCheck);
      const isImage = (d.mime_type?.startsWith('image/') ?? false) || looksLikeImageByExt;
      if (isImage) {
            // Try authenticated download (respects RLS)
            const { data, error } = await supabase.storage.from('user-docs').download(d.object_key);
            if (!error && data) {
              const url = URL.createObjectURL(data as Blob);
              urlsToRevoke.push(url);
              next[d.id] = url;
              continue;
            }
            // Fallback to signed URL
            const signed = await supabase.storage.from('user-docs').createSignedUrl(d.object_key, 60 * 5);
            next[d.id] = signed.data?.signedUrl ?? null;
          } else {
            next[d.id] = null;
          }
        } catch {
          next[d.id] = null;
        }
      }
      if (!cancelled) setThumbs(next);
    }
    if (savedDocs.length) buildThumbs();
    else setThumbs({});
    return () => {
      cancelled = true;
      // Cleanup any created object URLs
      for (const url of urlsToRevoke) URL.revokeObjectURL(url);
    };
  }, [savedDocs]);


  return (
    <>
    <Layout>
      {/* Hero Section - similar to other pages */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/5" />
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-20" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="doc-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#doc-pattern)" />
          </svg>
        </div>

        <Container className="relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="text-blue-200 text-xs sm:text-sm uppercase tracking-wider mb-3 font-semibold">
              DOCUMENT MANAGEMENT
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
              Manage Your Documents
            </h1>
            <p className="text-base sm:text-lg text-blue-200 mb-4">
              Upload once and reuse in future bookings. Secure storage for your important documents.
            </p>
          </div>
        </Container>
      </section>

      {/* Breadcrumbs */}
      <section className="bg-white border-b border-border">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Upload documents' }]} />
        </Container>
      </section>

      {/* Main Content */}
    <section className="py-8 sm:py-12 bg-gray-50">
        <Container>
      <Card className="w-full" padding="lg">
            {/* Profile documents manager */}
            {user && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Your saved documents</h2>
                  </div>
                  <p className="text-sm text-gray-600">Save your documents here so you don’t have to upload them every time you book. Clear photos work best (JPG or PNG).</p>
                </div>
                
                {savedLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-600">Loading your documents...</div>
                  </div>
                ) : savedError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-sm text-red-700">{savedError}</div>
                  </div>
                ) : (
                  <>
                    {savedDocs.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-6">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <div className="text-sm text-gray-600">You haven’t added any documents yet. Use the buttons below to add your NIC, passport, or another document.</div>
                      </div>
                    )}
                  <div className="space-y-6">
                    {(() => {
                      const nicFrontDoc = savedDocs.find(x => x.doc_type === 'nic-front') || null;
                      const nicBackDoc = savedDocs.find(x => x.doc_type === 'nic-back') || null;
                      const passportDoc = savedDocs.find(x => x.doc_type === 'passport') || null;
                      const others = savedDocs.filter(x => x.doc_type !== 'nic-front' && x.doc_type !== 'nic-back' && x.doc_type !== 'passport');
                      return (
                        <>
                          {/* NIC Card */}
                          <Card className="overflow-hidden" shadow={false} border={true}>
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <IdentificationIcon className="h-5 w-5 text-gray-700" />
                                <span className="font-medium text-gray-900">National Identity Card (NIC)</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setModal('nic')}
                                className="flex items-center gap-1"
                              >
                                <PlusIcon className="h-4 w-4" />
                                {nicFrontDoc || nicBackDoc ? 'Update photos' : 'Add NIC photos'}
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                              {/* Front slot */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <div className="text-xs font-medium text-gray-900 mb-2">Front side</div>
                                {nicFrontDoc ? (
                                  <div className="space-y-2">
                                    <div className="h-28 bg-white rounded border grid place-items-center overflow-hidden">
                                      {thumbs[nicFrontDoc.id] ? (
                                        <img src={thumbs[nicFrontDoc.id] || ''} alt="NIC front preview" className="max-h-28 w-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                      ) : (
                                        <div className="text-xs text-gray-400">No preview</div>
                                      )}
                                    </div>
                                    <div className="bg-white rounded p-2 border">
                                      <div className="text-sm text-gray-900 truncate font-medium">{nicFrontDoc.label || nicFrontDoc.original_name || 'NIC (front)'}</div>
                                      <div className="text-xs text-gray-500">{Math.round(((nicFrontDoc.size_bytes||0)/1024))} KB</div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={async () => {
                                        if (!confirm('Remove NIC (front)?')) return;
                                        await removeProfileDocument(nicFrontDoc.id);
                                        setSavedDocs(prev => prev.filter(x => x.id !== nicFrontDoc.id));
                                      }}
                                      className="w-full text-red-600 border-red-200 hover:bg-gray-50"
                                    >
                                      <TrashIcon className="h-4 w-4 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500 italic">Not uploaded</div>
                                )}
                              </div>
                              {/* Back slot */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <div className="text-xs font-medium text-gray-900 mb-2">Back side</div>
                                {nicBackDoc ? (
                                  <div className="space-y-2">
                                    <div className="h-28 bg-white rounded border grid place-items-center overflow-hidden">
                                      {thumbs[nicBackDoc.id] ? (
                                        <img src={thumbs[nicBackDoc.id] || ''} alt="NIC back preview" className="max-h-28 w-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                      ) : (
                                        <div className="text-xs text-gray-400">No preview</div>
                                      )}
                                    </div>
                                    <div className="bg-white rounded p-2 border">
                                      <div className="text-sm text-gray-900 truncate font-medium">{nicBackDoc.label || nicBackDoc.original_name || 'NIC (back)'}</div>
                                      <div className="text-xs text-gray-500">{Math.round(((nicBackDoc.size_bytes||0)/1024))} KB</div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={async () => {
                                        if (!confirm('Remove NIC (back)?')) return;
                                        await removeProfileDocument(nicBackDoc.id);
                                        setSavedDocs(prev => prev.filter(x => x.id !== nicBackDoc.id));
                                      }}
                                      className="w-full text-red-600 border-red-200 hover:bg-gray-50"
                                    >
                                      <TrashIcon className="h-4 w-4 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500 italic">Not uploaded</div>
                                )}
                              </div>
                            </div>
                          </Card>

                          {/* Passport Card */}
                          <Card className="overflow-hidden" shadow={false} border={true}>
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5 text-gray-700" />
                                <span className="font-medium text-gray-900">Passport</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setModal('passport')}
                                className="flex items-center gap-1"
                              >
                                <PlusIcon className="h-4 w-4" />
                                {passportDoc ? 'Replace photo' : 'Add passport photo'}
                              </Button>
                            </div>
                            <div className="p-4">
                              {passportDoc ? (
                                <div className="space-y-3">
                                  <div className="h-32 bg-white rounded border grid place-items-center overflow-hidden">
                                    {thumbs[passportDoc.id] ? (
                                      <img src={thumbs[passportDoc.id] || ''} alt="Passport preview" className="max-h-32 w-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                    ) : (
                                      <div className="text-xs text-gray-400">No preview</div>
                                    )}
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-sm text-gray-900 truncate font-medium">{passportDoc.label || passportDoc.original_name || 'Passport'}</div>
                                    <div className="text-xs text-gray-500">{Math.round(((passportDoc.size_bytes||0)/1024))} KB</div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={async () => {
                                      if (!confirm('Remove passport document?')) return;
                                      await removeProfileDocument(passportDoc.id);
                                      setSavedDocs(prev => prev.filter(x => x.id !== passportDoc.id));
                                    }}
                                    className="text-red-600 border-red-200 hover:bg-gray-50"
                                  >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500 text-sm italic">
                                  No passport uploaded yet
                                </div>
                              )}
                            </div>
                          </Card>

                          {/* Other Documents Card */}
                          <Card className="overflow-hidden" shadow={false} border={true}>
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <PhotoIcon className="h-5 w-5 text-gray-700" />
                                <span className="font-medium text-gray-900">Other documents</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setModal('custom')}
                                className="flex items-center gap-1"
                              >
                                <PlusIcon className="h-4 w-4" />
                                Add document
                              </Button>
                            </div>
                            <div className="p-4">
                              {others.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 text-sm italic">
                                  No other documents yet.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {others.map(d => (
                                    <div key={d.id} className="bg-white rounded-lg p-3 border">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1 flex items-center gap-3">
                                          {thumbs[d.id] ? (
                                            <img src={thumbs[d.id] || ''} alt="Document preview" className="h-12 w-12 rounded border object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                          ) : (
                                            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                          )}
                                          <div className="text-sm text-gray-900 truncate font-medium">{d.label || d.original_name || 'Document'}</div>
                                          <div className="text-xs text-gray-500">{d.doc_type || 'other'} • {Math.round(((d.size_bytes||0)/1024))} KB</div>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={async () => {
                                            if (!confirm('Remove this document?')) return;
                                            try { await removeProfileDocument(d.id); setSavedDocs(prev => prev.filter(x => x.id !== d.id)); } catch (e) { /* ignore */ }
                                          }}
                                          className="text-red-600 border-red-200 hover:bg-gray-50"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Card>
                        </>
                      );
                    })()}
                  </div>
                  </>
                )}
              </div>
            )}

            {!user ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in required</h3>
                <p className="text-sm text-gray-600 mb-4">Please sign in to manage your documents.</p>
                <Button onClick={() => setShowSignIn(true)}>Sign In</Button>
              </div>
            ) : null}
          </Card>
        </Container>
      </section>
    </Layout>
  <SignInModal open={!loading && showSignIn && !user} onClose={() => setShowSignIn(false)} context="upload" />

    {/* Upload Modals - Enhanced Design */}
    {user && modal && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {modal === 'nic' && <IdentificationIcon className="h-5 w-5 text-gray-700" />}
              {modal === 'passport' && <DocumentTextIcon className="h-5 w-5 text-gray-700" />}
              {modal === 'custom' && <PhotoIcon className="h-5 w-5 text-gray-700" />}
              <h3 className="font-semibold text-gray-900">
                {modal === 'nic' ? 'Add NIC Documents' : modal === 'passport' ? 'Add Passport' : 'Add Custom Document'}
              </h3>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100" 
              onClick={() => setModal(null)}
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {modal === 'nic' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Upload clear photos of both sides of your NIC. Photos (JPG/PNG) are preferred over PDFs for better quality.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">NIC Front Side</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        capture="environment" 
                        onChange={e => setNicFront(e.target.files?.[0] || null)}
                        className="flex-1 text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setCameraTarget('nic-front')}
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <CameraIcon className="h-4 w-4" />
                        Take photo
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">NIC Back Side (Optional)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        capture="environment" 
                        onChange={e => setNicBack(e.target.files?.[0] || null)}
                        className="flex-1 text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setCameraTarget('nic-back')}
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <CameraIcon className="h-4 w-4" />
                        Take photo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal === 'passport' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Upload a clear photo of your passport's main information page with your photo and details.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Passport Information Page</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      capture="environment" 
                      onChange={e => setPassportFile(e.target.files?.[0] || null)}
                      className="flex-1 text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setCameraTarget('passport')}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <CameraIcon className="h-4 w-4" />
                      Take photo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {modal === 'custom' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Add any other supporting documents such as marriage certificates, educational certificates, etc.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Document Label</label>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={customLabel} 
                    onChange={e => setCustomLabel(e.target.value)} 
                    placeholder="e.g., Marriage certificate, Birth certificate" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Upload Files (Multiple allowed)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      capture="environment" 
                      multiple 
                      onChange={e => setCustomFiles(Array.from(e.target.files || []))}
                      className="flex-1 text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setCameraTarget('custom')}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <CameraIcon className="h-4 w-4" />
                      Take photo
                    </Button>
                  </div>
                  {customFiles.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {customFiles.length} file(s) selected
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            {modal === 'nic' && (
              <Button 
                onClick={async () => {
                  if (!nicFront) return alert('Please select the NIC front image');
                  try {
                    setProfileBusy(true);
                    if (nicFront) await uploadProfileDocument(nicFront, 'nic-front', 'NIC (front)');
                    if (nicBack) await uploadProfileDocument(nicBack, 'nic-back', 'NIC (back)');
                    const docs = await listProfileDocuments();
                    setSavedDocs(docs);
                    setModal(null);
                    setNicFront(null); setNicBack(null);
                  } catch (e: any) {
                    alert(e?.message || 'Failed to upload NIC');
                  } finally {
                    setProfileBusy(false);
                  }
                }} 
                disabled={profileBusy}
                className="min-w-[80px]"
              >
                {profileBusy ? 'Uploading...' : 'Save'}
              </Button>
            )}
            {modal === 'passport' && (
              <Button 
                onClick={async () => {
                  if (!passportFile) return alert('Please select the passport page image');
                  try {
                    setProfileBusy(true);
                    await uploadProfileDocument(passportFile, 'passport', 'Passport');
                    const docs = await listProfileDocuments();
                    setSavedDocs(docs);
                    setModal(null);
                    setPassportFile(null);
                  } catch (e: any) {
                    alert(e?.message || 'Failed to upload passport');
                  } finally {
                    setProfileBusy(false);
                  }
                }} 
                disabled={profileBusy}
                className="min-w-[80px]"
              >
                {profileBusy ? 'Uploading...' : 'Save'}
              </Button>
            )}
            {modal === 'custom' && (
              <Button 
                onClick={async () => {
                  if (!customFiles.length) return alert('Please select at least one file');
                  try {
                    setProfileBusy(true);
                    for (const file of customFiles) {
                      await uploadProfileDocument(file, 'other', customLabel || file.name);
                    }
                    const docs = await listProfileDocuments();
                    setSavedDocs(docs);
                    setModal(null);
                    setCustomFiles([]); setCustomLabel('');
                  } catch (e: any) {
                    alert(e?.message || 'Failed to upload');
                  } finally {
                    setProfileBusy(false);
                  }
                }} 
                disabled={profileBusy || (!customLabel && customFiles.length === 0)}
                className="min-w-[80px]"
              >
                {profileBusy ? 'Uploading...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Camera Overlay - Enhanced */}
    {cameraTarget && (
      <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
        <div className="flex items-center justify-between p-4 text-white bg-black/50">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            <span className="font-medium">Camera — {cameraTarget.replace('-', ' ')}</span>
          </div>
          <button 
            className="px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 transition-colors" 
            onClick={closeCamera}
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <video 
            ref={videoRef} 
            className="max-h-full max-w-full rounded-lg shadow-2xl" 
            playsInline 
            muted 
          />
        </div>
        <div className="p-6 flex items-center justify-center gap-4">
          <Button size="lg" onClick={capturePhoto} className="min-w-[120px]">
            <CameraIcon className="h-5 w-5 mr-2" />
            Capture Photo
          </Button>
          <Button size="lg" variant="outline" onClick={closeCamera} className="min-w-[120px] text-white border-white hover:bg-white hover:text-black">
            Cancel
          </Button>
        </div>
      </div>
    )}
    </>
  );
};

export default DocumentsPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
