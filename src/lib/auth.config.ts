// ─── Imports ──────────────────────────────────────────────────────────────────
// ! Este archivo NO puede importar Prisma ni bcrypt — corre en Edge Runtime (middleware).
// La config base vive aquí; los providers con DB se definen en auth.ts.
import type { NextAuthConfig } from "next-auth";

// ─── Config ───────────────────────────────────────────────────────────────────
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Se ejecuta en cada request — no puede tocar la DB
    authorized({ auth }) {
      return !!auth?.user; // true = dejar pasar, false = redirigir a signIn
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [], // providers reales definidos en auth.ts
};
