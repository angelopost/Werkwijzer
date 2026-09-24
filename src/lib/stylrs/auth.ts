import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { SalonUserRole } from "@/generated/prisma/enums";

export type StylrsAuthUser = {
  id: string;
  name: string;
  email: string;
  salonId: string;
  salonName: string;
  salonSlug: string;
  salonRole: SalonUserRole;
  employeeId: string | null;
};

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.STYLRS_AUTH_SECRET,
  pages: {
    signIn: "/stylrs/login",
  },
  cookies: {
    sessionToken: {
      name: "stylrs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const salonUser = await prisma.salonUser.findUnique({
          where: { email },
          include: { salon: true },
        });
        if (!salonUser || !salonUser.isActive) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, salonUser.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        const authUser: StylrsAuthUser = {
          id: salonUser.id,
          name: salonUser.name,
          email: salonUser.email,
          salonId: salonUser.salonId,
          salonName: salonUser.salon.name,
          salonSlug: salonUser.salon.slug,
          salonRole: salonUser.role,
          employeeId: salonUser.employeeId,
        };
        return authUser as unknown as User;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as unknown as StylrsAuthUser;
        token.id = u.id;
        token.salonId = u.salonId;
        token.salonName = u.salonName;
        token.salonSlug = u.salonSlug;
        token.salonRole = u.salonRole;
        token.employeeId = u.employeeId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id!;
      session.user.salonId = token.salonId;
      session.user.salonName = token.salonName;
      session.user.salonSlug = token.salonSlug;
      session.user.salonRole = token.salonRole;
      session.user.employeeId = token.employeeId;
      return session;
    },
  },
});
