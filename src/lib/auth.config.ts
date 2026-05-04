// src/lib/auth.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Configuración de NextAuth SIN imports de Prisma ni bcrypt.
// Este archivo puede correr en el Edge Runtime (middleware).
//
// Por qué existe separado de auth.ts:
//   auth.ts importa Prisma → no puede correr en Edge (límite 1MB, sin Node APIs)
//   auth.config.ts solo define la config base → liviano, compatible con Edge
// ─────────────────────────────────────────────────────────────────────────────
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // En el middleware solo necesitamos saber si hay sesión (token válido).
    // authorized() se llama en cada request — no puede tocar la DB.
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
  providers: [], // Los providers se definen en auth.ts, no acá
};