import React, { useMemo } from 'react';
import { useUser } from "../context/UserContext";
import { departmentDash } from "../lib/departments";

import { Layout } from '../components/layout/Layout';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserSwitcher } from "../components/debug/UserSwitcher";
import { AppointmentTable, type AppointmentRow } from "../components/health/AppointmentTable";
import { AppointmentDonutCard } from "../components/charts/AppointmentDonut";

// Returns today's date in YYYY-MM-DD format
function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
type Dept = "health" | "immigration" | "motor_traffic" | "general";

export default function Dashboard() {
  const { user } = useUser();

  const data = user ? departmentDash[user.departmentId] : departmentDash.general;
  const dept: Dept = (user?.departmentId as Dept) ?? "general";
  const title = user
    ? `${capitalize(user.departmentId.replace("_", " "))} – ${capitalize(user.role)}`
    : "Dashboard";

  // --- Mock rows per department (swap with API later) ---
  const rowsByDept: Record<Dept, AppointmentRow[]> = useMemo(() => ({
    health: [
      { id: "H-001", department: "Health", date: today(), time: "09:00", status: "Scheduled", doctorName: "Dr. Perera", patientName: "N. Silva", room: "OPD-3" },
      { id: "H-002", department: "Health", date: today(), time: "10:30", status: "Delayed",   doctorName: "Dr. Fernando", patientName: "K. Jayasuriya", room: "Clinic-2", notes: "Priority: elderly" },
      { id: "H-003", department: "Health", date: today(), time: "11:15", status: "In progress", doctorName: "Dr. Samarasinghe", patientName: "M. Peris", room: "OPD-1" },
      // add examples of "On hold" & "Completed"
      { id: "H-004", department: "Health", date: today(), time: "12:00", status: "On hold", patientName: "Procedure", room: "OPD-2" },
      { id: "H-005", department: "Health", date: today(), time: "12:30", status: "Completed", patientName: "Checkup", room: "OPD-5" },
    ],
    immigration: [
      { id: "I-1201", department: "Immigration", date: today(), time: "08:45", status: "Scheduled", patientName: "Passport Renewal", room: "Counter 5" },
      { id: "I-1202", department: "Immigration", date: today(), time: "09:30", status: "In progress", patientName: "New Passport", room: "Counter 2" },
      { id: "I-1203", department: "Immigration", date: today(), time: "10:15", status: "Completed", patientName: "Collection", room: "Counter 1" },
    ],
    motor_traffic: [
      { id: "M-501", department: "Motor Traffic", date: today(), time: "10:00", status: "Scheduled", patientName: "DL Renewal", room: "Desk A" },
      { id: "M-502", department: "Motor Traffic", date: today(), time: "10:20", status: "No-show",   patientName: "Vehicle Transfer", room: "Desk C" },
      { id: "M-503", department: "Motor Traffic", date: today(), time: "11:10", status: "In progress", patientName: "New DL", room: "Desk B" },
    ],
    general: [
      { id: "G-9001", department: "General", date: today(), time: "09:15", status: "Completed", patientName: "Counter Services", room: "Front Desk" },
    ],
  }), []);

  const rows = rowsByDept[dept];

// ---- aggregate for donut (TODAY) ----
type Frame = "day" | "week" | "month";
const [frame, setFrame] = React.useState<Frame>("day");

// Helpers to filter by frame; today for now
const todayStr = today();
const frameRows = React.useMemo(() => {
  if (frame === "day") {
    return rows.filter(r => r.date === todayStr);
  }
  // TODO: swap with real weekly/monthly back-end queries
  return rows;
}, [rows, frame]);

const counts = React.useMemo(() => {
  const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  return {
    delayed:    frameRows.filter(x => eq(x.status, "Delayed")).length,
    onhold:     frameRows.filter(x => eq(x.status, "On hold")).length,
    inprogress: frameRows.filter(x => eq(x.status, "In progress")).length,
    completed:  frameRows.filter(x => eq(x.status, "Completed")).length,
  };
}, [frameRows]);

const donutSegments = [
  { label: "Delayed" as const,     value: counts.delayed,    className: "text-red-500" },
  { label: "On hold" as const,     value: counts.onhold,     className: "text-orange-400" },
  { label: "In progress" as const, value: counts.inprogress, className: "text-lime-400" },
  { label: "Completed" as const,   value: counts.completed,  className: "text-green-600" },
];


  return (
    <Layout title={title}>
      <Container className="py-8 space-y-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-violet-600">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Department-specific KPIs and quick actions.
            </p>
          </div>
          <UserSwitcher />
        </div>

        {/* Main grid: left content + right donut card */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT: KPIs + Shortcuts + Table */}
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-5 md:grid-cols-2">
              {data.kpis.map((k) => (
                <Card key={k.title} title={k.title} value={k.value} />
              ))}
            </div>

            {/* Shortcuts */}
            <div className="grid gap-5 md:grid-cols-3">
              {data.shortcuts.map((s) => (
                <Card key={s.title}>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                  <div className="mt-4">
                    <Button variant="primary">{s.action}</Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Table */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">{labelForDept(dept)} Appointments</h2>
              <AppointmentTable rows={rows} />
            </section>
          </div>

          {/* RIGHT: Donut card (sticky on long pages) */}
          <div className="lg:sticky lg:top-20 h-fit">
            <AppointmentDonutCard
              segments={donutSegments}
              updatedAt={new Date()}
              frame={frame}
              onChangeFrame={setFrame}
            />
          </div>
        </div>
      </Container>
    </Layout>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function labelForDept(d: Dept) {
  switch (d) {
    case "health": return "Health";
    case "immigration": return "Immigration";
    case "motor_traffic": return "Motor Traffic";
    default: return "General";
  }
}
