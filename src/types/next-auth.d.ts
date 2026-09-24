import type { Role, SalonUserRole } from "@/generated/prisma/enums";

// Twee losstaande NextAuth-instanties leven in deze codebase (Werkwijzer in
// src/lib/auth.ts, STYLRS in src/lib/stylrs/auth.ts). Module-augmentatie werkt
// projectbreed, dus de velden van beide staan hier samen (optioneel) i.p.v. in
// twee losse, onderling conflicterende declaraties.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      // Werkwijzer
      role?: Role;
      // STYLRS
      salonId?: string;
      salonName?: string;
      salonSlug?: string;
      salonRole?: SalonUserRole;
      employeeId?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role?: Role;
    salonId?: string;
    salonName?: string;
    salonSlug?: string;
    salonRole?: SalonUserRole;
    employeeId?: string | null;
  }
}
