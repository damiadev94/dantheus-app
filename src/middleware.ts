// ─── Imports ──────────────────────────────────────────────────────────────────
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// ─── Auth instance ────────────────────────────────────────────────────────────
const { auth } = NextAuth(authConfig);

// ─── Middleware ───────────────────────────────────────────────────────────────
export const middleware = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // * Route classification
  const isPublicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/dashboard");

  // ! Guard: redirige a login si la ruta es protegida y no hay sesión
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // ! Guard: redirige al home si ya hay sesión y accede a rutas de auth
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

// ─── Matcher config ───────────────────────────────────────────────────────────
export const config = {
  // Excluye archivos estáticos, imágenes y /api/cron (usa CRON_SECRET propio)
  matcher: ["/((?!api/cron|_next/static|_next/image|favicon.ico).*)"],
};
