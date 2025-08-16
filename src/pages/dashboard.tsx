import React from 'react';
import { useUser } from "../context/UserContext";
import { departmentDash } from "../lib/departments";

import { Layout } from '../components/layout/Layout';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserSwitcher } from "../components/debug/UserSwitcher";
import { AppointmentTable, type AppointmentRow } from "../components/health/AppointmentTable";
import { AppointmentDonutCard } from "../components/charts/AppointmentDonut";
import { CalendarMonthCard, type DayCounts } from "../components/calender/CalenderMonthCard";

// ---------- date helpers ----------
function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }

function startOfWeek(d: Date) { const day = d.getDay(); const diff = (day + 6) % 7; const x = new Date(d); x.setDate(d.getDate() - diff); x.setHours(0,0,0,0); return x; }
function endOfWeek(d: Date) { return addDays(startOfWeek(d), 6); }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function ordinal(n: number) { const s = ["th","st","nd","rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function formatDayLabel(d: Date) { return `${ordinal(d.getDate())} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`; }
function formatWeekLabel(d: Date) {
  const a = startOfWeek(d), b = endOfWeek(d);
  const sameMonth = a.getMonth() === b.getMonth();
  return sameMonth
    ? `${a.getDate()}–${b.getDate()} ${MONTHS[a.getMonth()]} ${b.getFullYear()}`
    : `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
}
function formatMonthLabel(d: Date) { return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`; }
// ----------------------------------

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
  const rowsByDept: Record<Dept, AppointmentRow[]> = React.useMemo(() => ({
    health: [
      { id: "H-001", department: "Health", date: today(), time: "09:00", status: "Scheduled", doctorName: "Dr. Perera", patientName: "N. Silva", room: "OPD-3" },
      { id: "H-002", department: "Health", date: today(), time: "10:30", status: "Delayed",   doctorName: "Dr. Fernando", patientName: "K. Jayasuriya", room: "Clinic-2", notes: "Priority: elderly" },
      { id: "H-003", department: "Health", date: today(), time: "11:15", status: "In progress", doctorName: "Dr. Samarasinghe", patientName: "M. Peris", room: "OPD-1" },
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

  // ---- timeframes & navigation ----
  type Frame = "day" | "week" | "month";
  const [frame, setFrame] = React.useState<Frame>("day");

  const [dayDate, setDayDate] = React.useState<Date>(new Date());
  const [weekDate, setWeekDate] = React.useState<Date>(new Date());                 // any day in the week
  const [monthDate, setMonthDate] = React.useState<Date>(startOfMonth(new Date())); // first of month

  function handlePrev() {
    if (frame === "day") setDayDate(addDays(dayDate, -1));
    else if (frame === "week") setWeekDate(addDays(weekDate, -7));
    else setMonthDate(addMonths(monthDate, -1));
  }
  function handleNext() {
    if (frame === "day") setDayDate(addDays(dayDate, +1));
    else if (frame === "week") setWeekDate(addDays(weekDate, +7));
    else setMonthDate(addMonths(monthDate, +1));
  }

  const periodLabel = React.useMemo(() => {
    if (frame === "day") return formatDayLabel(dayDate);
    if (frame === "week") return formatWeekLabel(weekDate);
    return formatMonthLabel(monthDate);
  }, [frame, dayDate, weekDate, monthDate]);

  // ---- filter rows for selected frame ----
  const frameRows = React.useMemo(() => {
    if (frame === "day") {
      const key = toYMD(dayDate);
      return rows.filter(r => r.date === key);
    }
    if (frame === "week") {
      const a = startOfWeek(weekDate), b = endOfWeek(weekDate);
      return rows.filter(r => {
        const d = parseYMD(r.date);
        return d >= a && d <= b;
      });
    }
    // month
    const start = startOfMonth(monthDate), end = endOfMonth(monthDate);
    return rows.filter(r => {
      const d = parseYMD(r.date);
      return d >= start && d <= end;
    });
  }, [rows, frame, dayDate, weekDate, monthDate]);

  // ---- counts for donut from frameRows ----
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

  // ---- daily counts map for calendar ----
  const countsByDate = React.useMemo(() => {
    const map = new Map<string, DayCounts>();
    const inc = (key: string, field: keyof DayCounts) => {
      const prev = map.get(key) || { delayed:0,onhold:0,inprogress:0,completed:0,total:0 };
      const next = { ...prev, [field]: (prev[field] as number) + 1, total: prev.total + 1 };
      map.set(key, next);
    };
    rows.forEach(r => {
      const key = r.date;
      switch (r.status) {
        case "Delayed":    inc(key, "delayed");    break;
        case "On hold":    inc(key, "onhold");     break;
        case "In progress":inc(key, "inprogress"); break;
        case "Completed":  inc(key, "completed");  break;
        default: /* ignore others for calendar dots */ break;
      }
    });
    return map;
  }, [rows]);

  const getCountsForDate = (d: Date): DayCounts =>
    countsByDate.get(toYMD(d)) || { delayed:0,onhold:0,inprogress:0,completed:0,total:0 };

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

        {/* Main grid: left content + right insight column */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
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
              {/* ✅ table follows the selected period */}
              <AppointmentTable rows={frameRows} />
            </section>
          </div>

          {/* RIGHT: Donut + Calendar (sticky) */}
          <div className="lg:sticky lg:top-20 h-fit">
            <AppointmentDonutCard
              segments={donutSegments}
              frame={frame}
              onChangeFrame={setFrame}
              periodLabel={periodLabel}
              onPrev={handlePrev}
              onNext={handleNext}
            />

            <CalendarMonthCard
              className="mt-6"
              monthDate={monthDate}
              selectedDate={frame === "day" ? dayDate : null}
              getCountsForDate={getCountsForDate}
              onPrevMonth={() => setMonthDate(addMonths(monthDate, -1))}
              onNextMonth={() => setMonthDate(addMonths(monthDate, +1))}
              onSelectDate={(d) => { setFrame("day"); setDayDate(d); }}
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
