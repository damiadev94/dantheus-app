import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const middleware = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/accounts");
    pathname.startsWith("/dashboard");
    
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Excluir archivos estáticos, imágenes y el cron (usa CRON_SECRET propio)
  matcher: ["/((?!api/cron|_next/static|_next/image|favicon.ico).*)"],
};
