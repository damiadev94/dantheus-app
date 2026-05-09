"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Wallet, Plus, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkspaceItem {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  pendingTasksCount: number;
}

interface SidebarProps {
  userId: string;
  userName: string;
  workspaces: WorkspaceItem[];
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon: Icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
        ${isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        }
      `}
    >
      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

// ─── Workspace item ───────────────────────────────────────────────────────────

function WorkspaceItem({ workspace }: { workspace: WorkspaceItem }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(`/workspace/${workspace.id}`);
  const dotColor = workspace.color ?? "#6366F1";

  return (
    <Link
      href={`/workspace/${workspace.id}`}
      className={`
        group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors
        ${isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        }
      `}
    >
      {/* Color dot */}
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />

      <span className="flex-1 truncate">{workspace.name}</span>

      {/* Pending badge */}
      {workspace.pendingTasksCount > 0 && (
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-sidebar-border text-sidebar-foreground tabular-nums">
          {workspace.pendingTasksCount}
        </span>
      )}

      {/* Arrow on hover */}
      <ChevronRight
        size={12}
        className={`shrink-0 transition-opacity ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"}`}
      />
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ userName, workspaces }: SidebarProps) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">

      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex size-6 items-center justify-center rounded bg-sidebar-primary">
          <span className="text-[10px] font-bold text-white">L</span>
        </div>
        <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-wide">
          LifeOS
        </span>
      </div>

      {/* Global nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        <NavItem href="/" icon={LayoutDashboard} label="Dashboard" exact />
        <NavItem href="/library" icon={BookOpen} label="Biblioteca" />
        <NavItem href="/accounts" icon={Wallet} label="Cuentas" />
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-sidebar-border" />

      {/* Workspaces */}
      <div className="flex flex-col gap-0.5 px-2">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
          Workspaces
        </p>

        {workspaces.length === 0 ? (
          <p className="px-3 py-1 text-xs text-sidebar-foreground/40 italic">
            Sin workspaces
          </p>
        ) : (
          workspaces.map((ws) => (
            <WorkspaceItem key={ws.id} workspace={ws} />
          ))
        )}

        {/* New workspace */}
        <Link
          href="/workspace/new"
          className="mt-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <Plus size={13} strokeWidth={2} />
          <span>Nuevo workspace</span>
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-[11px] font-semibold">
            {initials || "?"}
          </div>
          <span className="truncate text-xs text-sidebar-foreground">
            {userName}
          </span>
        </div>
      </div>
    </aside>
  );
}
