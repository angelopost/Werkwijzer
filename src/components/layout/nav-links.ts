export type NavLink = { href: string; label: string };

export const ADMIN_NAV: NavLink[] = [
  { href: "/rooster", label: "Rooster" },
  { href: "/goedkeuringen", label: "Goedkeuringen" },
  { href: "/medewerkers", label: "Medewerkers" },
];

export const STAFF_NAV: NavLink[] = [
  { href: "/mijn-rooster", label: "Mijn rooster" },
  { href: "/beschikbaarheid", label: "Beschikbaarheid" },
  { href: "/ruilen", label: "Ruilen" },
  { href: "/verlof", label: "Verlof" },
];
