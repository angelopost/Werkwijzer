export type IconKey = "calendar" | "check" | "users" | "clock" | "calendarCheck" | "repeat" | "file";

export type NavLink = { href: string; label: string; icon: IconKey };

export const ADMIN_NAV: NavLink[] = [
  { href: "/rooster", label: "Rooster", icon: "calendar" },
  { href: "/goedkeuringen", label: "Goedkeuringen", icon: "check" },
  { href: "/medewerkers", label: "Medewerkers", icon: "users" },
  { href: "/uren", label: "Uren", icon: "clock" },
];

export const STAFF_NAV: NavLink[] = [
  { href: "/mijn-rooster", label: "Mijn rooster", icon: "calendar" },
  { href: "/beschikbaarheid", label: "Beschikbaarheid", icon: "calendarCheck" },
  { href: "/ruilen", label: "Ruilen", icon: "repeat" },
  { href: "/verlof", label: "Verlof", icon: "file" },
];
