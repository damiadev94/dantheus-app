"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import Link from "next/link";

// ─── Props ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  userId: string;
  userName: string;
  workspaces: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    pendingTasksCount: number;
    projects: { tasks: { id: string }[] }[];
  }[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Sidebar({ userId: _userId, userName: _userName, workspaces: _workspaces }: SidebarProps) {
  return (
    <aside className="flex w-60 flex-col border-r bg-gray-50 p-4">
      <Link href="/" className="mb-6 text-lg font-bold">
        Dantheus
      </Link>

      {/* * Navegación global */}
      <nav className="flex flex-col gap-1 text-sm">
        <Link href="/" className="rounded px-3 py-2 hover:bg-gray-100">
          Dashboard
        </Link>
        <Link href="/library" className="rounded px-3 py-2 hover:bg-gray-100">
          Biblioteca
        </Link>
        <Link href="/accounts" className="rounded px-3 py-2 hover:bg-gray-100">
          Cuentas
        </Link>
      </nav>
    </aside>
  );
}
