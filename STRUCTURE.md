# Guía de Estructura del Proyecto

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5**
- **Prisma 6** + PostgreSQL (Neon serverless)
- **Tailwind CSS 4**
- NextAuth (pendiente de instalación)
- Zod (pendiente de instalación: `npm i zod`)

---

## Árbol de directorios

```
src/
├── app/                        ← Rutas (solo archivos de routing: page, layout, route)
│   ├── layout.tsx              ← Root layout: <html> + <body>, metadata global
│   ├── globals.css
│   ├── (auth)/                 ← Grupo sin layout propio. Comparte el root layout
│   │   ├── login/page.tsx      → /login
│   │   └── register/page.tsx   → /register
│   ├── (dashboard)/            ← Grupo con layout autenticado (sidebar + navbar)
│   │   ├── layout.tsx          ← DashboardLayout: Sidebar + Navbar
│   │   ├── page.tsx            → /
│   │   ├── workspace/[workspaceId]/
│   │   │   ├── page.tsx        → /workspace/:id
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx    → /workspace/:id/projects
│   │   │   │   └── [projectId]/page.tsx  → /workspace/:id/projects/:pid
│   │   │   ├── clients/page.tsx
│   │   │   ├── finances/page.tsx
│   │   │   └── notes/page.tsx
│   │   ├── library/page.tsx    → /library  (notas globales)
│   │   └── accounts/page.tsx   → /accounts (cuentas financieras globales)
│   └── api/
│       └── cron/route.ts       ← Job diario: ejecuta cuotas programadas (R14)
│
├── features/                   ← Lógica de negocio por dominio
│   ├── auth/
│   ├── workspace/
│   ├── project/
│   ├── task/
│   ├── client/
│   ├── finance/
│   └── note/
│
├── components/                 ← UI reutilizable, sin lógica de negocio
│   ├── ui/                     ← shadcn/ui (instalar con: npx shadcn@latest init)
│   ├── layout/                 ← Sidebar, Navbar, PageHeader
│   └── shared/                 ← DatePicker, CurrencyInput, StatusBadge
│
├── lib/
│   ├── prisma.ts               ← Singleton del cliente Prisma
│   ├── auth.ts                 ← Configuración NextAuth (esqueleto)
│   ├── utils.ts                ← formatCurrency, formatDate, cn
│   └── validations/            ← Schemas Zod por dominio
│
├── hooks/                      ← Hooks globales (no ligados a un feature)
│   ├── useCurrentUser.ts
│   └── useToast.ts
│
└── types/
    └── index.ts                ← Re-exporta todos los tipos de features
```

---

## Convenciones de cada feature

Cada feature en `src/features/<dominio>/` sigue la misma estructura:

| Archivo | Rol |
|---|---|
| `types.ts` | Tipos TypeScript del dominio (no importa de otros features) |
| `queries.ts` | Lecturas de DB — funciones async que llaman a `prisma.*` |
| `actions.ts` | Server Actions (`"use server"`) — mutaciones + `revalidatePath` |
| `components/` | Componentes React específicos del dominio |
| `hooks/` | Client hooks (`"use client"`) del dominio |

**Regla de dependencia:** `types ← queries ← actions`. Los componentes pueden importar de cualquiera. Los features no se importan entre sí; si necesitan tipos cruzados, se usa `src/types/index.ts`.

---

## Reglas de Next.js 16 a tener en cuenta

### `params` es una Promise

En Next.js 16, `params` y `searchParams` son promesas. Siempre se deben awaitar:

```tsx
// ✅ Correcto
export default async function Page({ params }: PageProps<'/workspace/[workspaceId]'>) {
  const { workspaceId } = await params;
}

// ❌ Incorrecto (Next.js <16)
export default function Page({ params }) {
  const { workspaceId } = params;
}
```

### Tipos de rutas dinámicas

Usar los helpers globales `PageProps` y `LayoutProps` (no requieren import):

```tsx
PageProps<'/workspace/[workspaceId]'>
LayoutProps<'/workspace/[workspaceId]'>
```

### Server vs Client Components

- Por defecto, todos los componentes en `app/` son **Server Components**.
- Agregar `"use client"` solo cuando se necesite: hooks, eventos, estado.
- Los Server Actions requieren `"use server"` en la función o en la cabecera del archivo.

### Route Groups

- `(auth)` y `(dashboard)` son **grupos de rutas** — la carpeta no aparece en la URL.
- `(auth)` no tiene `layout.tsx` propio → usa el root layout.
- `(dashboard)` tiene `layout.tsx` → sidebar + navbar para todas sus rutas.

---

## Reglas de negocio implementadas

| Regla | Dónde se aplica |
|---|---|
| R2: no eliminar proyecto General | `features/project/actions.ts → deleteProject` |
| R3: 1 proyecto General por workspace | `features/workspace/actions.ts → createWorkspace` |
| R9: InstallmentGroup genera N transactions SCHEDULED | `features/finance/actions.ts → createInstallmentGroup` |
| R10: balance = executed incomes − expenses | `features/finance/actions.ts → createTransaction` |
| R14: job diario ejecuta cuotas programadas | `app/api/cron/route.ts` |
| R15: crear workspace genera proyecto General | `features/workspace/actions.ts → createWorkspace` |

Las reglas R1, R4, R5, R6, R11, R12, R13, R19 se implementan en las acciones/queries del feature correspondiente (ver comentarios en `prisma/schema.prisma`).

---

## Pendientes para completar el stack

```bash
# Zod (validaciones)
npm i zod

# NextAuth v5
npm i next-auth@beta

# shadcn/ui
npx shadcn@latest init

# SWR o TanStack Query (fetching del cliente)
npm i swr
# o
npm i @tanstack/react-query
```

---

## Alias de importación

`@/*` apunta a `src/*`:

```ts
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { getProjects } from "@/features/project/queries";
```
