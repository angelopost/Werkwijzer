import { logout } from "@/actions/stylrs/auth";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/stylrs/theme-toggle";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { HeaderTitle } from "./header-title";
import type { NavLink } from "./nav-links";

export function AppShell({
  links,
  userName,
  salonName,
  children,
}: {
  links: NavLink[];
  userName: string;
  salonName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background p-3 sm:p-4">
      <div className="mx-auto flex h-[calc(100svh-1.5rem)] max-w-[1600px] overflow-hidden rounded-2xl border shadow-sm sm:h-[calc(100svh-2rem)]">
        <Sidebar links={links} userName={userName} salonName={salonName} />
        <div className="flex min-w-0 flex-1 flex-col bg-card md:border-l">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <MobileNav links={links} userName={userName} salonName={salonName} />
              <HeaderTitle links={links} />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserAvatar name={userName} />
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Uitloggen
                </Button>
              </form>
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
