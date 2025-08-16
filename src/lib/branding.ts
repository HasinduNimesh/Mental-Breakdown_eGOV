export type DeptKey =
  | "immigration"
  | "motor_traffic"
  | "registration"
  | "police"
  | "health"
  | "education"
  | "general";

export const BRAND = {
  govSeal: "/logos/gov-seal.svg",
  siteLogo: "/logos/egov-logo.svg",
};

type DeptMeta = { name: string; logoSrc?: string };

export const DEPT_BRAND: Record<DeptKey, DeptMeta> = {
  immigration: {
    name: "Department of Immigration and Emigration",
    logoSrc: "/logos/immigration.svg",
  },
  motor_traffic: {
    name: "Department of Motor Traffic",
    logoSrc: "/logos/motor-traffic.svg",
  },
  registration: {
    name: "Registrar General's Department",
    logoSrc: "/logos/registration.svg",
  },
  police: {
    name: "Sri Lanka Police",
    logoSrc: "/logos/police.svg",
  },
  // No dedicated logos – fallback to gov crest
  health: { name: "Ministry of Health" },
  education: { name: "Ministry of Education" },

  // Generic/default
  general: { name: "eGov System", logoSrc: "/logos/egov-logo.svg" },
};

// Helper to always return a logo (falls back to gov crest)
export function getDeptBrand(dept: DeptKey): { name: string; logoSrc: string } {
  const meta = DEPT_BRAND[dept] ?? DEPT_BRAND.general;
  return { name: meta.name, logoSrc: meta.logoSrc ?? BRAND.govSeal };
}
