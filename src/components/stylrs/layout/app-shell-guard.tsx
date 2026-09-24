import { requireSalonUser } from "@/lib/stylrs/permissions";
import { AppShell } from "./app-shell";
import { STYLRS_NAV, STYLRS_STAFF_NAV } from "./nav-links";

/// Gedeelde omlijsting voor de ingelogde STYLRS-schermen (dashboard, agenda,
/// enz.): controleert de sessie en toont de sidebar/navigatie. Bewust een
/// gewone (async) component in plaats van een route-group layout, zodat de
/// paginastructuur onder /stylrs plat blijft.
export async function StylrsAppShellGuard({ children }: { children: React.ReactNode }) {
  const user = await requireSalonUser();
  const links = user.salonRole === "OWNER" ? STYLRS_NAV : STYLRS_STAFF_NAV;

  return (
    <AppShell links={links} userName={user.name} salonName={user.salonName}>
      {children}
    </AppShell>
  );
}
