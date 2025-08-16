"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span suppressHydrationWarning aria-label="Current date and time" className="tabular-nums text-slate-600">
      {now ? now.toLocaleString() : ""}
    </span>
  );
}
