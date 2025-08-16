import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "officer" | "superadmin";
export type DepartmentId = 
    "police"
  | "health"
  | "education"
  | "immigration"
  | "registration"
  | "motor_traffic"
  | "general";

export interface User {
  id: string;
  name: string;
  role: Role;
  departmentId: DepartmentId;
}

type Ctx = {
  user: User | null;
  setUser: (u: User | null) => void;
};

const UserContext = createContext<Ctx>({ user: null, setUser: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load from localStorage for now (simulate login). Replace with real session later.
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("demo_user") : null;
    if (raw) setUser(JSON.parse(raw));
    else {
      // default demo user
      const demo: User = { id: "1", name: "Demo Admin", role: "admin", departmentId: "health" };
      localStorage.setItem("demo_user", JSON.stringify(demo));
      setUser(demo);
    }
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
