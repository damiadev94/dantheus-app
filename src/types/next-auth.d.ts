import type { DefaultSession } from "next-auth";

// Extiende el tipo Session de NextAuth para incluir user.id.
// El callback session() en auth.ts ya agrega el id al token — aquí le decimos a TS que existe.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
