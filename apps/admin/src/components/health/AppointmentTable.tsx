import React, { useMemo, useState } from "react";
import clsx from "clsx";

export type AppointmentStatus =
  | "Scheduled"
  | "In progress"
  | "On hold"
  | "Completed"
  | "Cancelled"
  | "No-show"
  | "Delayed";

export type AppointmentRow = {
  id: string;                 // appointment number
  department: string;
  date: string;               // YYYY-MM-DD
  time: string;               // HH:mm
  status: AppointmentStatus;

  // details (shown on expand)
  doctorName?: string;
  patientName?: string;
  room?: string;
  notes?: string;
};

type Props = {
  rows: AppointmentRow[];
  searchable?: boolean;
  onChangeStatus?: (id: string, next: AppointmentStatus) => void;
};

export function AppointmentTable({ rows, searchable = true, onChangeStatus }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Record<string, AppointmentStatus>>({});

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(r =>
      [r.id, r.department, r.date, r.time, r.status, r.doctorName, r.patientName, r.room]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(needle))
    );
  }, [rows, q]);

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function timeMeta(date: string, time: string) {
    try {
      const target = new Date(`${date}T${time}:00`);
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const abs = Math.abs(diffMs);
      const mins = Math.floor(abs / 60000);
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      const hhmm = hrs ? `${hrs}h ${rem}m` : `${rem}m`;
      if (diffMs < -5 * 60000) return { label: `Delayed by ${hhmm}`, isLate: true };
      if (diffMs < 0) return { label: "Starting now", isLate: false };
      return { label: `In ${hhmm}`, isLate: false };
    } catch {
      return { label: "-", isLate: false };
    }
  }

  const badge = (status: AppointmentStatus) => {
    const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
    switch (status) {
      case "Scheduled":   return <span className={clsx(base, "bg-blue-100 text-blue-700")}>Scheduled</span>;
      case "In progress": return <span className={clsx(base, "bg-lime-100 text-lime-700")}>In progress</span>;
      case "On hold":     return <span className={clsx(base, "bg-orange-100 text-orange-700")}>On hold</span>;
      case "Completed":   return <span className={clsx(base, "bg-green-100 text-green-700")}>Completed</span>;
      case "Delayed":     return <span className={clsx(base, "bg-red-100 text-red-700")}>Delayed</span>;
      case "Cancelled":   return <span className={clsx(base, "bg-gray-200 text-gray-700")}>Cancelled</span>;
      case "No-show":     return <span className={clsx(base, "bg-slate-100 text-slate-700")}>No-show</span>;
      default:            return <span className={clsx(base, "bg-gray-200 text-gray-700")}>{status}</span>;
    }
  };

  const allStatuses: AppointmentStatus[] = [
      "Scheduled","In progress","Completed","Cancelled","No-show","Delayed","On hold"
    ];

  function exportCSV() {
    const headers = ['Appointment','Date','Time','Department','Status'];
    const lines = [headers.join(',')].concat(
      filtered.map(r => [r.id, r.date, r.time, r.department, r.status].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'appointments.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-semibold">Appointments</h2>
        <div className="flex items-center gap-2">
          {searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-9 w-56 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button onClick={exportCSV} className="h-9 rounded-lg border px-3 text-sm hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left w-10"></th>
              <th className="p-3 text-left">Appointment</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">ETA / Delay</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const t = timeMeta(r.date, r.time);
              const open = !!expanded[r.id];
              const chosen = draft[r.id] ?? r.status;
              return (
                <React.Fragment key={r.id}>
                  <tr className={clsx("border-t", open && "bg-gray-50/60")}>
                    <td className="p-3">
                      <button
                        onClick={() => toggle(r.id)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                        aria-expanded={open}
                        aria-controls={`row-${r.id}`}
                      >
                        {open ? "−" : "+"}
                      </button>
                    </td>
                    <td className="p-3 font-medium">{r.id}</td>
                    <td className="p-3">{r.date}</td>
                    <td className="p-3">{r.time}</td>
                    <td className="p-3">{r.department}</td>
                    <td className="p-3">{badge(r.status)}</td>
                    <td className={clsx("p-3", t.isLate ? "text-red-600" : "text-gray-700")}>{t.label}</td>
                  </tr>

                  {open && (
                    <tr id={`row-${r.id}`} className="border-t">
                      <td className="p-3"></td>
                      <td className="p-3" colSpan={6}>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                          <Info label="Doctor" value={r.doctorName || "—"} />
                          <Info label="Patient" value={r.patientName || "—"} />
                          <Info label="Room" value={r.room || "—"} />
                          {r.notes && <Info label="Notes" value={r.notes} />}
                        </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                          <label className="text-xs text-gray-500 dark:text-slate-400">Change status</label>
                          <select
                            className="rounded border px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700"
                            value={chosen}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [r.id]: e.target.value as AppointmentStatus }))
                            }
                          >
                            {allStatuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => onChangeStatus?.(r.id, chosen)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No appointments.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-gray-500">
        Showing {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
