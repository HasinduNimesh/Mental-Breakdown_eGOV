export type MockUserRecord = {
  nic: string;
  name: string;
  departmentId:
    | "police"
    | "health"
    | "education"
    | "immigration"
    | "registration"
    | "motor_traffic"
    | "general";
  role: "admin" | "officer";
};

export const MOCK_USERS: Record<string, MockUserRecord> = {
  // Police
  "200200001234": {
    nic: "200200001234",
    name: "Senuda Weliwatta",
    departmentId: "police",
    role: "admin",
  },

  // Health
  "200100001234": {
    nic: "200100001234",
    name: "Sasini Lekamge",
    departmentId: "health",
    role: "admin",
  },

  // Immigration
  "199900001111": {
    nic: "199900001111",
    name: "Hasindu N",
    departmentId: "immigration",
    role: "officer",
  },

  // Motor Traffic
  "199800008888": {
    nic: "199800008888",
    name: "Dinuka S",
    departmentId: "motor_traffic",
    role: "officer",
  },

  // Registration of Persons
  "199700007777": {
    nic: "199700007777",
    name: "Ishara Perera",
    departmentId: "registration",
    role: "admin",
  },

  // Education
  "199600006666": {
    nic: "199600006666",
    name: "Madhavi Jayawardena",
    departmentId: "education",
    role: "officer",
  },

  // General (default)
  "199500005555": {
    nic: "199500005555",
    name: "Chamodi Fernando",
    departmentId: "general",
    role: "officer",
  },
};
