import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Sidebar } from "./sidebar";
import { HeaderTitle } from "./header-title";
import type { NavLink } from "./nav-links";

export function AppShell({
  links,
  userName,
  roleLabel,
  children,
}: {
  links: NavLink[];
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background p-3 sm:p-4">
      <div className="mx-auto flex h-[calc(100svh-1.5rem)] max-w-[1600px] overflow-hidden rounded-2xl border shadow-sm sm:h-[calc(100svh-2rem)]">
        <Sidebar links={links} userName={userName} roleLabel={roleLabel} />
        <div className="flex flex-1 flex-col border-l bg-card">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <HeaderTitle links={links} />
            <div className="flex items-center gap-3">
              <UserAvatar name={userName} />
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Uitloggen
                </Button>
              </form>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
