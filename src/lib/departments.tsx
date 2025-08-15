import type { DepartmentId } from "../context/UserContext";

type Stat = { title: string; value: string };
type Shortcut = { title: string; desc: string; action: string };

export const departmentDash: Record<DepartmentId, { kpis: Stat[]; shortcuts: Shortcut[] }> = {
  health: {
    kpis: [
      { title: "Clinics Configured", value: "27" },
      { title: "Desks Active", value: "9" },
      { title: "Avg Wait", value: "11m" },
      { title: "Pending Doc Reviews", value: "5" },
    ],
    shortcuts: [
      { title: "Document Pre-check", desc: "Approve or request fixes", action: "Open" },
      { title: "Live Queue", desc: "Monitor tokens and desks", action: "Open" },
      { title: "Scheduling", desc: "Set working hours & holidays", action: "Configure" },
    ],
  },
  immigration: {
    kpis: [
      { title: "Passports Today", value: "642" },
      { title: "Counters Active", value: "12" },
      { title: "Avg Processing", value: "7m" },
      { title: "No-show Rate", value: "3.2%" },
    ],
    shortcuts: [
      { title: "Passport Services", desc: "Renewal & new requests", action: "Open" },
      { title: "Officer Roster", desc: "Assign counters", action: "Manage" },
      { title: "Analytics", desc: "Peaks & SLA", action: "View" },
    ],
  },
  motor_traffic: {
    kpis: [
      { title: "DL Renewals Today", value: "488" },
      { title: "Vehicle Services", value: "194" },
      { title: "Avg Wait", value: "9m" },
      { title: "Walk-ins", value: "73" },
    ],
    shortcuts: [
      { title: "Services", desc: "Driving license & vehicle", action: "Open" },
      { title: "Queues", desc: "Token management", action: "Open" },
      { title: "Capacity", desc: "Desks & working hours", action: "Configure" },
    ],
  },
  general: {
    kpis: [
      { title: "Departments", value: "12" },
      { title: "Active Officers", value: "48" },
      { title: "Today’s Appointments", value: "1,236" },
      { title: "No-show Rate", value: "4.7%" },
    ],
    shortcuts: [
      { title: "Manage Services", desc: "Create & edit services", action: "Open" },
      { title: "Manage Users", desc: "Assign roles", action: "Open" },
      { title: "Analytics", desc: "Wait time & capacity", action: "View" },
    ],
  },
};
