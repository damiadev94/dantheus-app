@AGENTS.md

# CLAUDE.md — LifeOS

Contexto completo del proyecto para Claude Code. Leer antes de cualquier tarea.

---

## Qué es este proyecto

Sistema de gestión personal con workspaces aislados. Cada workspace es un contexto de negocio independiente (SaaS, YouTube, Freelance, etc.). El usuario puede tener N workspaces sin que se mezclen sus datos.

**Módulos:** Proyectos (Cliente → Proyecto → Tarea), Finanzas (cuentas, movimientos, cuotas), Notas/Recursos/Aprendizaje, Dashboard global y por workspace.

---

## Stack

```
Framework     Next.js 15 — App Router
Lenguaje      TypeScript (strict)
Estilos       Tailwind CSS + shadcn/ui
Estado        TanStack Query (servidor) + Zustand (cliente)
Formularios   React Hook Form + Zod
Rich text     Tiptap
ORM           Prisma 5
Auth          NextAuth v5 (Credentials + JWT)
DB            PostgreSQL en Neon (serverless)
Deploy        Vercel (con Cron Jobs)
Jobs          Vercel Cron → /api/cron (diario 9am UTC)
```

---

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/               # Rutas sin layout autenticado
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/          # Rutas autenticadas con sidebar
│   │   ├── layout.tsx        # Verifica sesión + renderiza Sidebar
│   │   ├── page.tsx          # Dashboard global
│   │   ├── workspace/[workspaceId]/
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   ├── clients/
│   │   │   ├── finances/
│   │   │   └── notes/
│   │   ├── library/page.tsx  # Biblioteca global
│   │   └── accounts/page.tsx # Cuentas globales
│   └── api/
│       └── cron/route.ts     # Job diario de cuotas
├── features/                 # Lógica por dominio
│   ├── auth/
│   │   ├── components/       # LoginForm, RegisterForm
│   │   └── actions.ts        # login(), register()
│   ├── workspace/
│   │   ├── components/
│   │   ├── actions.ts        # createWorkspace(), updateWorkspace(), deleteWorkspace()
│   │   └── queries.ts        # getWorkspace(), getWorkspacesWithMetrics()
│   ├── project/
│   │   ├── components/
│   │   ├── actions.ts        # createProject(), updateProjectStatus(), deleteProject()
│   │   └── queries.ts        # getProjectsByWorkspace(), getTasksByProject()
│   ├── task/
│   │   ├── components/
│   │   ├── actions.ts        # createTask(), updateTaskStatus()
│   │   └── queries.ts        # getPendingTasksByWorkspace()
│   ├── client/
│   │   ├── components/
│   │   ├── actions.ts
│   │   └── queries.ts
│   ├── finance/
│   │   ├── components/
│   │   ├── actions.ts        # createTransaction(), createInstallmentGroup()
│   │   └── queries.ts        # getMonthlySummary(), getAccountBalances()
│   └── note/
│       ├── components/
│       ├── actions.ts
│       └── queries.ts
├── components/
│   ├── ui/                   # shadcn/ui — NO modificar directamente
│   ├── layout/               # Sidebar, Navbar, PageHeader
│   └── shared/               # DatePicker, CurrencyInput, StatusBadge
├── lib/
│   ├── prisma.ts             # Singleton de Prisma
│   ├── auth.ts               # Configuración NextAuth v5
│   ├── utils.ts              # cn(), formatCurrency(), formatDate(), getCurrentPeriod()
│   └── validations/          # Schemas Zod por feature
│       ├── auth.ts
│       ├── workspace.ts
│       ├── project.ts
│       ├── task.ts
│       ├── finance.ts
│       └── note.ts
├── hooks/                    # Hooks globales (useCurrentUser, useToast)
└── types/                    # Tipos TypeScript globales
```

---

## Arquitectura — 4 capas (OBLIGATORIO respetar)

```
UI (components)
    ↓ llama a
Server Actions (features/*/actions.ts)   ← valida + autoriza + ejecuta
    ↓ llama a
Queries / DB Layer (features/*/queries.ts o prisma directo)
    ↓
PostgreSQL via Prisma
```

**Regla crítica:** Los archivos en `components/` NUNCA importan `prisma` directamente.
Toda operación de DB pasa por `actions.ts` o `queries.ts`.

---

## Patrón de Server Action (5 etapas — siempre en este orden)

```typescript
'use server'

export async function hacerAlgo(formData: unknown) {
  // 1. AUTENTICAR
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // 2. VALIDAR (Zod)
  const parsed = schema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  // 3. AUTORIZAR (el recurso pertenece al usuario)
  const recurso = await prisma.entidad.findFirst({
    where: { id: parsed.data.id, workspace: { userId: session.user.id } }
  })
  if (!recurso) return { error: 'No encontrado' }

  // 4. EJECUTAR
  await prisma.entidad.create({ data: parsed.data })

  // 5. REVALIDAR
  revalidatePath('/ruta/afectada')
  return { success: true }
}
```

**Nunca saltear la etapa 3.** Si falta la autorización, usuario A puede modificar datos de usuario B.

---

## Reglas de negocio críticas (de la Fase 2)

```
R1  — project.clientId XOR project.categoryId (nunca ambos)
R2  — Proyecto con isGeneral=true NO puede eliminarse
R3  — Exactamente 1 proyecto isGeneral=true por workspace
R4  — Nota local solo vincula proyectos del mismo workspace
R5  — Nota global vincula proyectos de cualquier workspace del usuario
R6  — Tag local solo usable en su mismo workspace
R7  — Eliminar workspace → cascada elimina entidades locales
R8  — Cuentas y notas globales sobreviven a la eliminación de workspace
R9  — Crear InstallmentGroup genera N transactions con status=SCHEDULED
R10 — balance = initialBalance + SUM(income EXECUTED) - SUM(expense EXECUTED)
R11 — type=TRANSFER genera 2 transactions: expense (origen) + income (destino)
R12 — Solo status=EXECUTED impacta resúmenes y metas
R13 — WorkspaceGoal se evalúa por workspace y mes (formato YYYY-MM)
R14 — Transactions SCHEDULED se ejecutan automáticamente via cron (/api/cron)
R15 — Crear workspace → auto-crea Project{isGeneral:true, name:'General'}
R16 — Usuario puede tener N workspaces activos
R17 — Desactivar workspace oculta sin eliminar datos (isActive=false)
```

---

## Entidades — scope global vs. local

```
GLOBALES (del usuario)        LOCALES (del workspace)
──────────────────────        ───────────────────────
User                          Workspace
Account                       Client
Category                      Project → Task
Note (scope=GLOBAL)           Transaction → InstallmentGroup
Tag  (scope=GLOBAL)           Note (scope=LOCAL)
                              Tag  (scope=LOCAL)
                              WorkspaceGoal

Tablas N:M: NoteProject, NoteTag, TransactionTag
```

**Note y Tag usan el patrón scope:** `userId` presente = global, `workspaceId` presente = local. Nunca ambos, nunca ninguno.

---

## Schema Prisma — resumen de enums

```
AccountType:        CASH | BANK | DIGITAL_WALLET | CREDIT | INVESTMENT
NoteType:           NOTE | RESOURCE | LEARNING
ScopeType:          GLOBAL | LOCAL
NoteStatus:         ACTIVE | ARCHIVED
LearningStatus:     PENDING | IN_PROGRESS | COMPLETED
ProjectStatus:      IDEA | ACTIVE | PAUSED | CLOSED
TaskStatus:         PENDING | IN_PROGRESS | DONE | CANCELLED
TaskPriority:       LOW | MEDIUM | HIGH
TransactionType:    INCOME | EXPENSE | TRANSFER
TransactionStatus:  EXECUTED | SCHEDULED
```

---

## Variables de entorno requeridas

```bash
DATABASE_URL     # Neon pooled (pgbouncer=true) — para queries
DIRECT_URL       # Neon direct — para migraciones
AUTH_SECRET      # NextAuth secret (openssl rand -base64 32)
NEXTAUTH_URL     # http://localhost:3000 en dev, URL de Vercel en prod
CRON_SECRET      # Bearer token para autenticar el cron de Vercel
```

---

## Convenciones de código

**Nombrado:**
- Archivos de componentes: `PascalCase.tsx`
- Archivos de utilidades: `camelCase.ts`
- Variables y funciones: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE`

**TypeScript:**
- Usar `Prisma.ModelGetPayload<{include: {...}}>` para tipos de queries complejas
- Nunca `any`. Si no se sabe el tipo, usar `unknown` y validar con Zod
- Los tipos inferidos de Zod reemplazan interfaces duplicadas: `type X = z.infer<typeof xSchema>`

**Componentes:**
- Server Components por defecto — agregar `'use client'` solo cuando sea necesario
- Los formularios siempre usan React Hook Form + zodResolver
- Los errores del servidor se muestran inline, no en toast para errores de validación

**Queries Prisma:**
- Siempre usar `select` explícito cuando no se necesitan todos los campos
- Los `include` profundos (más de 2 niveles) se reescriben como queries separadas
- Índices ya definidos en el schema — no agregar `orderBy` sin índice

**Imports:**
- Usar alias `@/` siempre (nunca paths relativos con `../`)
- Orden: librerías externas → `@/lib` → `@/features` → `@/components` → tipos

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# DB
npx prisma migrate dev --name descripcion   # nueva migración
npx prisma generate                          # regenerar cliente
npx prisma studio                            # UI visual de la DB en :5555
npx prisma migrate reset                     # reset completo (solo dev)

# Build
npm run build
npm run lint
```

---

## Estado actual de implementación

| Módulo | Estado |
|---|---|
| Setup e infraestructura | ✅ Completo |
| Autenticación | ✅ Completo |
| Workspaces | ✅ Actions + Queries |
| Proyectos y Tareas | ✅ Actions + Queries |
| Finanzas | ✅ Actions + Queries + Cron |
| Notas y Biblioteca | ⏳ Pendiente |
| Dashboards | ⏳ Pendiente |
| Componentes UI (Sidebar, Kanban) | ⏳ Pendiente |

**Siguiente tarea prioritaria:** Implementar `src/features/note/` con editor Tiptap y lógica de scope global/local (R4, R5).

---

## Lo que NO hacer

- No crear API Routes para mutaciones — usar Server Actions
- No importar `prisma` desde componentes UI
- No usar `useEffect` para fetching — usar TanStack Query o Server Components
- No hardcodear IDs ni strings de enums — usar las constantes de Prisma
- No eliminar el proyecto General de un workspace (R2)
- No commitear `.env` — solo `.env.example`
- No crear migraciones manualmente — siempre via `prisma migrate dev`