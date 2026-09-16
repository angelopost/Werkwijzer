import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import type { NavLink } from "./nav-links";

export function AppShell({
  links,
  userName,
  roleLabel,
  title,
  children,
}: {
  links: NavLink[];
  userName: string;
  roleLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <Sidebar links={links} userName={userName} roleLabel={roleLabel} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <h1 className="text-lg font-semibold">{title}</h1>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Uitloggen
            </Button>
          </form>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
