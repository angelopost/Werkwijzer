import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_PREFIXES = ["/rooster", "/medewerkers", "/functies", "/goedkeuringen", "/uren"];
const STAFF_PREFIXES = ["/mijn-rooster", "/beschikbaarheid", "/ruilen", "/verlof"];
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
    if (user) {
      return NextResponse.redirect(new URL(homeFor(user.role), req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!user) {
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
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
