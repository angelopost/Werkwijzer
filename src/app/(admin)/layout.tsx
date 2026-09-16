import { requireAdmin } from "@/lib/permissions";
import { AppShell } from "@/components/layout/app-shell";
import { ADMIN_NAV } from "@/components/layout/nav-links";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AppShell links={ADMIN_NAV} userName={user.name} roleLabel="Beheerder" title="Rooster">
      {children}
    </AppShell>
  );
}
