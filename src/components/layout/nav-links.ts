export type NavLink = { href: string; label: string };

export const ADMIN_NAV: NavLink[] = [
  { href: "/rooster", label: "Rooster" },
  { href: "/medewerkers", label: "Medewerkers" },
];

export const STAFF_NAV: NavLink[] = [{ href: "/mijn-rooster", label: "Mijn rooster" }];
