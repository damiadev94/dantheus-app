// ─── Imports ──────────────────────────────────────────────────────────────────
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";

// ─── Auth instance ────────────────────────────────────────────────────────────
// Exporta: auth (sesión), signIn, signOut, handlers (GET/POST para el route handler)
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // * 1. Validar formato antes de tocar la DB
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // * 2. Buscar usuario
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, email: true, name: true, passwordHash: true, avatarUrl: true },
        });
        if (!user) return null;

        // * 3. Verificar password — bcrypt.compare es resistente a timing attacks
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) return null;

        // * 4. Retornar sin passwordHash — NextAuth lo pasa al callback jwt()
        return { id: user.id, email: user.email, name: user.name, image: user.avatarUrl };
      },
    }),
  ],

  // ─── Callbacks ──────────────────────────────────────────────────────────────
  callbacks: {
    // `user` solo existe en el primer login — en requests subsiguientes no está
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Expone session.user.id en Server Components y Actions via auth()
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // errores redirigen al login con ?error=...
  },

  // JWT en cookie httpOnly — sin tabla de sesiones en DB
  session: { strategy: "jwt" },
});
