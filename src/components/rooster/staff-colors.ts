/** Eigen kleur per medewerker in het rooster. Oranje/amber ontbreekt bewust: dat is
 * gereserveerd voor verlof en ziekmeldingen. Volledige klassenamen, zodat Tailwind ze ziet. */
export type StaffPalette = {
  /** Dienstblok: zachte vulling met een egale accentrand links. */
  block: string;
  /** Avatar in dezelfde kleur. */
  avatar: string;
};

const PALETTES: StaffPalette[] = [
  {
    block: "border-blue-500 bg-blue-100 text-blue-950 dark:bg-blue-500/20 dark:text-blue-100",
    avatar: "bg-blue-500 text-white",
  },
  {
    block: "border-emerald-500 bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-100",
    avatar: "bg-emerald-500 text-white",
  },
  {
    block: "border-violet-500 bg-violet-100 text-violet-950 dark:bg-violet-500/20 dark:text-violet-100",
    avatar: "bg-violet-500 text-white",
  },
  {
    block: "border-rose-500 bg-rose-100 text-rose-950 dark:bg-rose-500/20 dark:text-rose-100",
    avatar: "bg-rose-500 text-white",
  },
  {
    block: "border-cyan-500 bg-cyan-100 text-cyan-950 dark:bg-cyan-500/20 dark:text-cyan-100",
    avatar: "bg-cyan-500 text-white",
  },
  {
    block: "border-lime-500 bg-lime-100 text-lime-950 dark:bg-lime-500/20 dark:text-lime-100",
    avatar: "bg-lime-600 text-white",
  },
  {
    block: "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-950 dark:bg-fuchsia-500/20 dark:text-fuchsia-100",
    avatar: "bg-fuchsia-500 text-white",
  },
  {
    block: "border-indigo-500 bg-indigo-100 text-indigo-950 dark:bg-indigo-500/20 dark:text-indigo-100",
    avatar: "bg-indigo-500 text-white",
  },
  {
    block: "border-teal-500 bg-teal-100 text-teal-950 dark:bg-teal-500/20 dark:text-teal-100",
    avatar: "bg-teal-500 text-white",
  },
  {
    block: "border-pink-500 bg-pink-100 text-pink-950 dark:bg-pink-500/20 dark:text-pink-100",
    avatar: "bg-pink-500 text-white",
  },
  {
    block: "border-sky-500 bg-sky-100 text-sky-950 dark:bg-sky-500/20 dark:text-sky-100",
    avatar: "bg-sky-500 text-white",
  },
  {
    block: "border-yellow-500 bg-yellow-100 text-yellow-950 dark:bg-yellow-500/20 dark:text-yellow-100",
    avatar: "bg-yellow-500 text-white",
  },
];

export function staffPalette(colorIndex: number): StaffPalette {
  return PALETTES[((colorIndex % PALETTES.length) + PALETTES.length) % PALETTES.length];
}
