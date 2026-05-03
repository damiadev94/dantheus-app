import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dantheus",
  description: "Sistema de gestión personal de proyectos, finanzas y notas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
