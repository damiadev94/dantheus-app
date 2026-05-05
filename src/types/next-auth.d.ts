// ─── Augmentations ────────────────────────────────────────────────────────────
// Extiende Session para incluir user.id — el callback session() en auth.ts lo inyecta
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
