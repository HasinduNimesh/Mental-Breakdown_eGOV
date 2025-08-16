// src/pages/login.tsx
import React from "react";
import { useRouter } from "next/router";
import { MOCK_USERS } from "../lib/mockUsers";
import { useUser } from "../context/UserContext";
import { Layout } from "../components/layout/Layout";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";

export default function LoginPage() {
  const { setUser } = useUser();
  const router = useRouter();
  const [nic, setNic] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function normalizeNIC(value: string) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const key = normalizeNIC(nic);
    if (!/^\d{12}$/.test(key)) {
      setError("Enter a valid 12-digit NIC number.");
      return;
    }
    setLoading(true);

    // mock DB lookup
    const rec = MOCK_USERS[key];
    if (!rec) {
      setLoading(false);
      setError("No account found for this NIC.");
      return;
    }

    // set user context + persist for reloads
    const user = {
      id: rec.nic,
      name: rec.name,
      nic: rec.nic,
      departmentId: rec.departmentId,
      role: rec.role,
    };
    localStorage.setItem("demo_user", JSON.stringify(user));
    setUser(user);

    // go to dashboard
    router.push("/dashboard");
  };

  return (
    <Layout title="Sign in">
      <Container className="py-16 max-w-md">
        <h1 className="text-2xl font-semibold">Sign in with NIC</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter your NIC number to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">NIC Number</label>
            <input
              inputMode="numeric"
              pattern="\d*"
              maxLength={12}
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              placeholder="200200001234"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700"
            />
            <p className="mt-1 text-xs text-slate-500">Use 12 digits (no spaces).</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-xs text-slate-500">
          Demo NICs: 200200001234 (Police), 200100001234 (Health)
        </div>
      </Container>
    </Layout>
  );
}
