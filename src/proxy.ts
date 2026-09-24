import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_PREFIXES = ["/rooster", "/medewerkers", "/goedkeuringen", "/uren", "/inklokken", "/todo", "/todo-medewerkers"];
const STAFF_PREFIXES = ["/mijn-rooster", "/verlof", "/mijn-inklok", "/mijn-uren", "/mijn-to-do"];
const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/uitnodiging/"];

function homeFor(role: "ADMIN" | "STAFF") {
  return role === "ADMIN" ? "/rooster" : "/mijn-rooster";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    if (user?.role) {
      return NextResponse.redirect(new URL(homeFor(user.role), req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!user?.role) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isStaffRoute = STAFF_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isAdminRoute && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL(homeFor(user.role), req.nextUrl));
  }

  if (isStaffRoute && user.role !== "STAFF") {
    return NextResponse.redirect(new URL(homeFor(user.role), req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // STYLRS (/stylrs, /book) en zijn eigen auth-routes hebben een volledig
  // losstaand inlogsysteem (zie src/lib/stylrs/auth.ts + (app)-route-layouts)
  // en worden daarom hier uitgesloten van Werkwijzer's sessiecontrole.
  matcher: [
    "/((?!api|stylrs|book|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)",
  ],
};
