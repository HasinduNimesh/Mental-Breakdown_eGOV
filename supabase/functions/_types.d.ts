// Local ambient types to satisfy VS Code/TypeScript in a Node workspace.
// The Supabase Deno runtime provides these at deploy/run time.

// Minimal Deno env typing
declare const Deno: {
  env: { get(name: string): string | undefined };
};

// Minimal server.serve typing from Deno std http
declare module "https://deno.land/std@0.224.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

// Minimal supabase-js createClient typing via esm.sh import
declare module "https://esm.sh/@supabase/supabase-js@2.45.4" {
  export function createClient(
    url: string,
    anonKey: string,
    options?: any
  ): any;
}
