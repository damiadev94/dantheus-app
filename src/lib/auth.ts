// src/lib/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Configuración central de NextAuth v5.
//
// Exporta:
//   auth      → función para obtener la sesión (en Server Components y Actions)
//   signIn    → función para iniciar sesión
//   signOut   → función para cerrar sesión
//   handlers  → GET y POST para el Route Handler de NextAuth
//
// Flujo de autenticación:
//   1. Usuario envía email + password al formulario de login
//   2. credentials.authorize() busca el usuario en DB y verifica el password
//   3. Si es válido, NextAuth crea un JWT con el userId incluido
//   4. El JWT se guarda en una cookie httpOnly (segura, no accesible desde JS)
//   5. En cada request, auth() lee la cookie y retorna la sesión
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials); // Validamos el formato con Zod antes de tocar la DB
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          // Buscamos el usuario por email
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            avatarUrl: true,
          },
        });

        if (!user) return null; // Si no existe el usuario, retornamos null

        // Comparamos el password enviado contra el hash almacenado, bcrypt.compare() es resistente a timing attacks
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) return null;

        // Retornamos el usuario sin el hash del password
        // NextAuth lo recibe y lo pasa al callback jwt()
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
  ],

  callbacks: {
    // jwt() se ejecuta cuando se crea o actualiza el token JWT.
    // Aquí agregamos el userId al token para poder accederlo después.
    // Sin esto, session.user.id no existiría.
    jwt({ token, user }) {
      // `user` solo existe en el primer login, no en requests subsiguientes
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // session() transforma el token en el objeto de sesión que recibe el cliente.
    // Agregamos el id al objeto session.user para tenerlo disponible
    // en Server Components y Server Actions via auth().
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    // Rutas personalizadas en lugar de las páginas default de NextAuth
    signIn: "/login",
    error: "/login", // Los errores redirigen al login con ?error=...
  },

  // La sesión se maneja con JWT (no con base de datos)
  // Más simple y sin necesidad de tabla de sesiones en la DB
  session: { strategy: "jwt" },
});
