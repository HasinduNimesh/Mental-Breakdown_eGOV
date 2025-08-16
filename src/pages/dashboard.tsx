import React, { useMemo } from 'react';
import Link from 'next/link';
import { useUser } from "../context/UserContext";
import { departmentDash } from "../lib/departments";

import { Layout } from '../components/layout/Layout';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserSwitcher } from "../components/debug/UserSwitcher";
import { AppointmentTable, type AppointmentRow } from "../components/health/AppointmentTable";

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

  return (
    <Layout title={title}>
      <Container className="py-8 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-violet-600">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Department-specific KPIs and quick actions.
            </p>
          </div>
          {/* DEV ONLY: simulate login/department */}
          <UserSwitcher />
        </div>

        {/* KPIs */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {data.kpis.map((k) => (
            <Card key={k.title} title={k.title} value={k.value} />
          ))}
        </div>

        {/* Shortcuts */}
        <div className="grid gap-5 md:grid-cols-3">
          {data.shortcuts.map((s) => (
            <Card key={s.title} subtle>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
              <div className="mt-4">
                <Button variant="primary" rightIcon={<RightArrow />}>{s.action}</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Department-specific Appointments */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold"> {labelForDept(dept)} Appointments</h2>
          <AppointmentTable rows={rows} />
        </section>
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

function RightArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden className="-mr-1">
      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
