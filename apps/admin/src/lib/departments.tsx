export type DeptId =
  | "police"
  | "health"
  | "education"
  | "immigration"
  | "registration"
  | "motor_traffic"
  | "general";

type Stat = { title: string; value: string };
type Shortcut = { title: string; desc: string; action: string };

export const departmentDash: Record<DeptId, { kpis: Stat[]; shortcuts: Shortcut[] }> = {
  police: {
    kpis: [
      { title: "Appointments Today", value: "112" },
      { title: "Counters Active", value: "14" },
      { title: "Avg Wait", value: "6m" },
      { title: "Escalations", value: "3" },
    ],
    shortcuts: [
      { title: "Complaints Desk", desc: "Manage appointments & tokens", action: "Open" },
      { title: "Verification", desc: "License/clearance verification", action: "Open" },
      { title: "Analytics", desc: "Peaks & SLA compliance", action: "View" },
    ],
  },
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
      { title: "Scheduling", desc: "Working hours & holidays", action: "Configure" },
    ],
  },
  education: {
    kpis: [
      { title: "Appointments Today", value: "64" },
      { title: "Scholarships", value: "12" },
      { title: "Avg Wait", value: "8m" },
      { title: "Completed", value: "41" },
    ],
    shortcuts: [
      { title: "Scholarship Office", desc: "Interviews & inquiries", action: "Open" },
      { title: "Records", desc: "Certificates/attestations", action: "Open" },
      { title: "Analytics", desc: "Load & throughput", action: "View" },
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
  registration: {
    kpis: [
      { title: "NIC Apps Today", value: "288" },
      { title: "Corrections", value: "19" },
      { title: "Avg Wait", value: "9m" },
      { title: "Completed", value: "231" },
    ],
    shortcuts: [
      { title: "NIC Desk", desc: "Applications & corrections", action: "Open" },
      { title: "Verification", desc: "Birth/Address docs", action: "Open" },
      { title: "Analytics", desc: "Throughput & backlog", action: "View" },
    ],
  },
  motor_traffic: {
    kpis: [
      { title: "DL Renewals", value: "488" },
      { title: "Vehicle Services", value: "194" },
      { title: "Avg Wait", value: "9m" },
      { title: "Walk-ins", value: "73" },
    ],
    shortcuts: [
      { title: "Services", desc: "Driving license & vehicle", action: "Open" },
      { title: "Queues", desc: "Token management", action: "Open" },
      { title: "Capacity", desc: "Desks & hours", action: "Configure" },
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
