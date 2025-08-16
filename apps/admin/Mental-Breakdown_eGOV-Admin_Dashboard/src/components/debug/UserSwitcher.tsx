import React from "react";
import { useUser, type DepartmentId, type Role, type User } from "../../context/UserContext";

const departments: DepartmentId[] = ["police", "health","education","immigration","registration","motor_traffic","general"];
const roles: Role[] = ["superadmin", "admin", "officer"];

export function UserSwitcher() {
  const { user, setUser } = useUser();
  if (!user) return null;

  function update(patch: Partial<Pick<User, "role" | "departmentId">>) {
    const u: User = { ...(user as User), ...patch };
    localStorage.setItem("demo_user", JSON.stringify(u));
    setUser(u);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      <label className="text-gray-500">Dept</label>
      <select
        className="border rounded px-2 py-1"
        value={user.departmentId}
        onChange={(e) => update({ departmentId: e.target.value as DepartmentId })}
      >
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label className="text-gray-500 ml-2">Role</label>
      <select
        className="border rounded px-2 py-1"
        value={user.role}
        onChange={(e) => update({ role: e.target.value as Role })}
      >
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}
