// src/lib/mockUsers.ts
export type DepartmentId =
  | "police"
  | "health"
  | "education"
  | "immigration"
  | "registration"
  | "motor_traffic"
  | "general";

export type Role = "superadmin" | "admin" | "officer";

export type MockUserRecord = {
  nic: string;          // keep as plain string
  name: string;
  departmentId: DepartmentId;
  role: Role;
};

// 🔐 Mock DB (keyed by NIC)
export const MOCK_USERS: Record<string, MockUserRecord> = {
  // examples you gave:
  "200200001234": { nic: "200200001234", name: "Senuda Weliwatta", departmentId: "police",       role: "admin" },
  "200100001234": { nic: "200100001234", name: "Sasini Lekamge",   departmentId: "health",       role: "admin" },

  // a couple more for testing
  "199900001111": { nic: "199900001111", name: "Hasindu N",        departmentId: "immigration",  role: "officer" },
  "199800008888": { nic: "199800008888", name: "Dinuka S",         departmentId: "motor_traffic",role: "officer" },
};
