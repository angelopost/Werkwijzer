import { requireSalonUser } from "@/lib/stylrs/permissions";
import { AppShell } from "@/components/stylrs/layout/app-shell";
import { STYLRS_NAV, STYLRS_STAFF_NAV } from "@/components/stylrs/layout/nav-links";

export default async function StylrsAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSalonUser();
  const links = user.salonRole === "OWNER" ? STYLRS_NAV : STYLRS_STAFF_NAV;

  return (
    <AppShell links={links} userName={user.name} salonName={user.salonName}>
      {children}
    </AppShell>
  );
}
