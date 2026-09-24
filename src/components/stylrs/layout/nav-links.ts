export type IconKey =
  | "dashboard"
  | "calendar"
  | "list"
  | "users"
  | "team"
  | "scissors"
  | "zap"
  | "chart"
  | "settings";

export type NavLink = { href: string; label: string; icon: IconKey };

export const STYLRS_NAV: NavLink[] = [
  { href: "/stylrs/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/stylrs/agenda", label: "Agenda", icon: "calendar" },
  { href: "/stylrs/afspraken", label: "Afspraken", icon: "list" },
  { href: "/stylrs/klanten", label: "Klanten", icon: "users" },
  { href: "/stylrs/medewerkers", label: "Medewerkers", icon: "team" },
  { href: "/stylrs/behandelingen", label: "Behandelingen", icon: "scissors" },
  { href: "/stylrs/automatiseringen", label: "Automatiseringen", icon: "zap" },
  { href: "/stylrs/statistieken", label: "Statistieken", icon: "chart" },
  { href: "/stylrs/instellingen", label: "Instellingen", icon: "settings" },
];

/// Alleen voor OWNER zichtbaar; STAFF ziet een beperkte set.
export const STYLRS_STAFF_NAV: NavLink[] = [
  { href: "/stylrs/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/stylrs/agenda", label: "Agenda", icon: "calendar" },
  { href: "/stylrs/afspraken", label: "Afspraken", icon: "list" },
  { href: "/stylrs/klanten", label: "Klanten", icon: "users" },
];
