import { requireStaff } from "@/lib/permissions";
import { AppShell } from "@/components/layout/app-shell";
import { STAFF_NAV } from "@/components/layout/nav-links";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <AppShell links={STAFF_NAV} userName={user.name} roleLabel="Personeel">
      {children}
    </AppShell>
  );
}
