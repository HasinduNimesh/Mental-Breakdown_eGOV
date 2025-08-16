// Supabase Edge Function: profile-upsert
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  } as const;

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return new Response(JSON.stringify({ error: "UNAUTHENTICATED" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return new Response(JSON.stringify({ error: "INVALID_JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } }); }

  const allowed = ["full_name","nic","dob","phone","address_line1","address_line2","district","postal_code","preferred_language"];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in payload) update[k] = payload[k];
  // If nothing to update, still create a stub row with just the id
  if (Object.keys(update).length === 0) {
    const { error } = await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });
  if (error) return new Response(JSON.stringify({ error: error.code || "UPSERT_FAILED" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  return new Response(JSON.stringify({ ok: true, stub: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...update }, { onConflict: "id" });
  if (error) return new Response(JSON.stringify({ error: error.code || "UPSERT_FAILED" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
