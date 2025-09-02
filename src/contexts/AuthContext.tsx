import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Compute a stable deviceId for this browser (persisted in localStorage)
    const DEVKEY = 'egov_device_id_v1';
    function getDeviceId() {
      try {
        const existing = localStorage.getItem(DEVKEY);
        if (existing) return existing;
        const id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(DEVKEY, id);
        return id;
      } catch { return 'dev_unknown'; }
    }
    async function resetAndGoHome() {
      try {
        await supabase.auth.signOut();
      } catch {}
      try { localStorage.removeItem(DEVKEY); } catch {}
      try { window.location.assign('/'); } catch {}
    }
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        // Validate stored session; if stale/invalid, clear and redirect
        if (data.session) {
          const { data: u, error: ue } = await supabase.auth.getUser();
          if (ue || !u?.user) {
            await resetAndGoHome();
            return;
          }
        }
      } catch {
        // env might not be set yet; keep unauthenticated
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // create stub profile if needed via server API proxy (avoids CORS/preflight issues)
        try {
          const token = s.access_token;
          await fetch('/api/profile-upsert', {
            method: 'POST',
            headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          });
        } catch {}
        // Claim single-device session lock
        try {
          const token = (await supabase.auth.getSession()).data.session?.access_token;
          if (token) {
            const resp = await fetch('/api/session-claim', {
              method: 'POST',
              headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
              // Send force: true initially to avoid transient 409 logs and stale locks
              body: JSON.stringify({ deviceId: getDeviceId(), force: true })
            });
            if (resp.status === 409) {
              // Auto sign out other device by force-claiming the lock to this device
              try {
                const forceResp = await fetch('/api/session-claim', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ deviceId: getDeviceId(), force: true })
                });
                if (!forceResp.ok) {
                  // Delete all sessions (server-side revoke) so the next login starts clean
                  try { await (supabase.auth.signOut as any)({ scope: 'global' }); } catch {}
                  alert('Could not take over the session. Please try again later.');
                }
              } catch {
                try { await (supabase.auth.signOut as any)({ scope: 'global' }); } catch { await supabase.auth.signOut(); }
              }
            }
          }
        } catch {}
      }
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signOut: async () => { await supabase.auth.signOut(); },
    signOutAll: async () => {
      try {
        // Invalidate all refresh tokens for this user across devices
        // If the type defs complain, we cast as any to allow the supported runtime option
        await (supabase.auth.signOut as any)({ scope: 'global' });
      } catch {
        // fallback to local sign out
        await supabase.auth.signOut();
      }
    },
  }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
