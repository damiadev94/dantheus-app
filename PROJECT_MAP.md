# PROJECT MAP — dantheus-app (LifeOS)

> Estado real del código al 2026-05-09. Actualizar tras cada sprint.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Auth | NextAuth v5 beta (Credentials + JWT) |
| ORM | Prisma 6 → PostgreSQL en Neon |
| Estado cliente | SWR 2 (fetch) + Zustand (pendiente) |
| Formularios | React Hook Form + Zod 4 |
| Rich text | Tiptap (instalado, sin usar aún) |
| Tests | Vitest |

---

## Árbol de carpetas — `src/`

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   ✅ NextAuth handler
│   │   └── cron/route.ts                 ✅ Ejecuta SCHEDULED → EXECUTED diario
│   ├── (auth)/
│   │   ├── login/page.tsx                ✅ Renderiza LoginForm
│   │   └── register/page.tsx             ✅ Renderiza RegisterForm
│   └── (dashboard)/
│       ├── layout.tsx                    ✅ Verifica sesión, pasa props a Sidebar
│       ├── page.tsx                      🔲 Stub vacío (solo PageHeader)
│       ├── accounts/page.tsx             🔲 Stub vacío
│       ├── library/page.tsx              🔲 Stub vacío
│       └── workspace/[workspaceId]/
│           ├── page.tsx                  🔲 Stub vacío
│           ├── projects/
│           │   ├── page.tsx              🔲 Stub vacío
│           │   └── [projectId]/page.tsx  🔲 Stub vacío
│           ├── clients/page.tsx          🔲 Stub vacío
│           ├── finances/page.tsx         🔲 Stub vacío
│           └── notes/page.tsx            🔲 Stub vacío
├── features/
│   ├── auth/
│   │   ├── actions.ts                    ✅ login(), register(), logout()
│   │   ├── types.ts                      ✅
│   │   └── components/
│   │       ├── LoginForm.tsx             ✅ RHF + server action
│   │       └── RegisterForm.tsx          ✅ RHF + server action
│   ├── workspace/
│   │   ├── actions.ts                    ✅ createWorkspace(), updateWorkspace(), deleteWorkspace()
│   │   ├── queries.ts                    ✅ getWorkspace(), getWorkspacesWithMetrics()
│   │   ├── types.ts                      ✅
│   │   ├── hooks/
│   │   │   ├── useWorkspace.ts           ✅ SWR wrapper
│   │   │   └── useWorkspaces.ts          ✅ SWR wrapper
│   │   └── components/
│   │       ├── WorkspaceCard.tsx         🔲 Esqueleto (sin datos reales)
│   │       └── WorkspaceSwitcher.tsx     🔲 Esqueleto
│   ├── project/
│   │   ├── actions.ts                    ✅ createProject(), updateProjectStatus(), deleteProject()
│   │   ├── queries.ts                    ✅ getProjectsByWorkspace(), getTasksByProject(), getPendingTasksByWorkspace()
│   │   ├── types.ts                      ✅
│   │   └── components/
│   │       ├── ProjectCard.tsx           🔲 Esqueleto
│   │       ├── ProjectForm.tsx           🔲 Esqueleto
│   │       └── ProjectBoard.tsx          🔲 Esqueleto (Kanban sin drag-and-drop)
│   ├── task/
│   │   ├── actions.ts                    ✅ createTask(), updateTaskStatus() | ⚠️ deleteTask() = TODO
│   │   ├── queries.ts                    ✅ (usado por project/queries.ts)
│   │   ├── types.ts                      ✅
│   │   └── components/
│   │       ├── TaskItem.tsx              🔲 Esqueleto
│   │       ├── TaskForm.tsx              🔲 Esqueleto
│   │       └── TaskBoard.tsx             🔲 Esqueleto
│   ├── client/
│   │   ├── actions.ts                    ✅ createClient(), updateClient()
│   │   ├── queries.ts                    ✅
│   │   ├── types.ts                      ✅
│   │   └── components/
│   │       └── ClientCard.tsx            🔲 Esqueleto
│   ├── finance/
│   │   ├── actions.ts                    ✅ createTransaction(), createInstallmentGroup()
│   │   ├── queries.ts                    ✅ getAccountBalance(), getMonthlySummary(), getTransactions()
│   │   ├── types.ts                      ✅
│   │   └── components/
│   │       ├── TransactionList.tsx       🔲 Esqueleto
│   │       ├── FinanceSummary.tsx        🔲 Esqueleto
│   │       └── AccountCard.tsx           🔲 Esqueleto
│   └── note/
│       ├── actions.ts                    ✅ createNote(), updateNote(), archiveNote()
│       ├── queries.ts                    ✅ getGlobalNotes(), getWorkspaceNotes(), getNote()
│       ├── types.ts                      ✅
│       ├── hooks/useNotes.ts             ✅ SWR wrapper
│       └── components/
│           ├── NoteCard.tsx              🔲 Esqueleto
│           ├── NoteList.tsx              🔲 Esqueleto
│           └── NoteEditor.tsx            🔲 Esqueleto (Tiptap sin integrar)
├── components/
│   ├── ui/                               ✅ shadcn button + base (pendiente agregar más)
│   ├── layout/
│   │   ├── Sidebar.tsx                   ⚠️ Renderiza, pero NO muestra workspaces (props ignoradas)
│   │   ├── Navbar.tsx                    🔲 Esqueleto
│   │   └── PageHeader.tsx                ✅ Funciona, usado en todos los stubs
│   ├── shared/
│   │   ├── StatusBadge.tsx               🔲 Esqueleto
│   │   ├── CurrencyInput.tsx             🔲 Esqueleto
│   │   └── DatePicker.tsx                🔲 Esqueleto
│   └── providers/AppProviders.tsx        ✅ SessionProvider + QueryClientProvider
├── lib/
│   ├── prisma.ts                         ✅ Singleton con global cache
│   ├── auth.ts                           ✅ NextAuth config completa
│   ├── auth.config.ts                    ✅ Config edge-compatible
│   ├── utils.ts                          ✅ cn, formatCurrency, formatDate, getCurrentPeriod
│   └── validations/
│       ├── auth.ts                       ✅ loginSchema, registerSchema
│       ├── workspace.ts                  ✅ createWorkspaceSchema
│       ├── project.ts                    ✅ createProjectSchema (R1: clientId XOR categoryId)
│       ├── task.ts                       ✅ createTaskSchema
│       ├── finance.ts                    ✅ createTransactionSchema, createInstallmentSchema
│       └── note.ts                       ✅ createNoteSchema
├── hooks/
│   ├── useCurrentUser.ts                 ✅
│   └── useToast.ts                       ✅
├── types/
│   ├── index.ts                          ✅ PageProps helper para App Router
│   └── next-auth.d.ts                    ✅ Augmenta Session con user.id
├── middleware.ts                         ✅ Protege rutas autenticadas, excluye /api/cron
└── __tests__/
    ├── setup/
    │   ├── globalSetup.ts                ✅
    │   ├── mocks.ts                      ✅
    │   └── authMock.ts                   ✅
    └── features/
        ├── workspace.test.ts             ✅
        ├── project.test.ts               ✅
        ├── task.test.ts                  ✅
        ├── client.test.ts                ✅
        ├── finance.test.ts               ✅
        ├── note.test.ts                  ✅
        └── cron.test.ts                  ✅
```

---

## Server Actions — inventario completo

| Feature | Función | Estado | Reglas |
|---|---|---|---|
| **auth** | `login()` | ✅ | — |
| | `register()` | ✅ | — |
| | `logout()` | ✅ | — |
| **workspace** | `createWorkspace()` | ✅ | R15, R3 |
| | `updateWorkspace()` | ✅ | — |
| | `deleteWorkspace()` | ✅ | R7 |
| **project** | `createProject()` | ✅ | R1 |
| | `updateProjectStatus()` | ✅ | — |
| | `deleteProject()` | ✅ | R2 |
| **task** | `createTask()` | ✅ | order automático |
| | `updateTaskStatus()` | ✅ | — |
| | `deleteTask()` | ⚠️ TODO | — |
| **client** | `createClient()` | ✅ | — |
| | `updateClient()` | ✅ | — |
| **finance** | `createTransaction()` | ✅ | R10, R11 |
| | `createInstallmentGroup()` | ✅ | R9, R14 |
| **note** | `createNote()` | ✅ | R4, R5 |
| | `updateNote()` | ✅ | — |
| | `archiveNote()` | ✅ | — |

**Acciones faltantes (no implementadas):**
- `deleteTask()` — stub con TODO
- `deleteClient()` — no existe
- `deleteTransaction()` — no existe
- `updateTransaction()` — no existe
- `createAccount()` — no existe (solo se consulta)
- `updateAccount()` — no existe
- `deleteAccount()` — no existe
- `createCategory()` — no existe
- `linkNoteToProject()` — no existe (tabla NoteProject sin usar)
- `addTagToNote()` — no existe (tabla NoteTag sin usar)
- `createWorkspaceGoal()` — no existe (R13 sin implementar)

---

## Queries — inventario completo

| Feature | Función | Estado |
|---|---|---|
| **workspace** | `getWorkspace(id)` | ✅ |
| | `getWorkspacesWithMetrics(userId)` | ✅ |
| **project** | `getProjectsByWorkspace(workspaceId)` | ✅ |
| | `getTasksByProject(projectId)` | ✅ |
| | `getPendingTasksByWorkspace(workspaceId)` | ✅ |
| **client** | *(en queries.ts, no documentadas)* | ❓ verificar |
| **finance** | `getAccountBalance(accountId)` | ✅ |
| | `getMonthlySummary(workspaceId, period)` | ✅ |
| | `getTransactions(workspaceId)` | ✅ last 50 |
| **note** | `getGlobalNotes(userId)` | ✅ |
| | `getWorkspaceNotes(workspaceId)` | ✅ |
| | `getNote(noteId)` | ✅ |

**Queries faltantes:**
- `getAccountsByUser(userId)` — para la página /accounts
- `getCategoriesByUser(userId)` — para el form de proyectos
- `getClientsByWorkspace(workspaceId)` — para la página /clients
- `getWorkspaceGoals(workspaceId, period)` — R13
- `getInstallmentGroups(workspaceId)` — para ver cuotas activas

---

## API Routes

| Ruta | Método | Propósito | Estado |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler | ✅ |
| `/api/cron` | GET | Ejecuta transacciones SCHEDULED del día (R14) | ✅ |

> No hay ni habrá otras API routes — todo va por Server Actions.

---

## Rutas del frontend

| Ruta | Componente | UI implementada |
|---|---|---|
| `/login` | LoginForm | ✅ |
| `/register` | RegisterForm | ✅ |
| `/` | DashboardPage | 🔲 Stub |
| `/accounts` | AccountsPage | 🔲 Stub |
| `/library` | LibraryPage | 🔲 Stub |
| `/workspace/[id]` | WorkspacePage | 🔲 Stub |
| `/workspace/[id]/projects` | ProjectsPage | 🔲 Stub |
| `/workspace/[id]/projects/[pid]` | ProjectDetailPage | 🔲 Stub |
| `/workspace/[id]/clients` | ClientsPage | 🔲 Stub |
| `/workspace/[id]/finances` | FinancesPage | 🔲 Stub |
| `/workspace/[id]/notes` | WorkspaceNotesPage | 🔲 Stub |

---

## Schema Prisma — modelos y relaciones clave

```
User ──< Workspace ──< Project ──< Task
     │              └──< Transaction ──< InstallmentGroup
     │              └──< Note (LOCAL)
     │              └──< Tag (LOCAL)
     │              └──< WorkspaceGoal
     │              └──< Client
     │
     ├──< Account         (GLOBAL)
     ├──< Category        (GLOBAL)
     ├──< Note (GLOBAL)   ──<> NoteProject >──< Project
     │                    ──<> NoteTag     >──< Tag
     └──< Tag (GLOBAL)
```

**Enums en uso:**
- `AccountType`: CASH | BANK | DIGITAL_WALLET | CREDIT | INVESTMENT
- `NoteType`: NOTE | RESOURCE | LEARNING
- `ScopeType`: GLOBAL | LOCAL
- `NoteStatus`: ACTIVE | ARCHIVED
- `LearningStatus`: PENDING | IN_PROGRESS | COMPLETED
- `ProjectStatus`: IDEA | ACTIVE | PAUSED | CLOSED
- `TaskStatus`: PENDING | IN_PROGRESS | DONE | CANCELLED
- `TaskPriority`: LOW | MEDIUM | HIGH
- `TransactionType`: INCOME | EXPENSE | TRANSFER
- `TransactionStatus`: EXECUTED | SCHEDULED

---

## Estado real por módulo

| Módulo | Backend (actions+queries) | Validaciones (Zod) | Tests | UI (components+pages) |
|---|---|---|---|---|
| Auth | ✅ Completo | ✅ | ✅ | ✅ Completo |
| Workspace | ✅ Completo | ✅ | ✅ | 🔲 Sin UI real |
| Proyectos | ✅ Completo | ✅ | ✅ | 🔲 Sin UI real |
| Tareas | ⚠️ deleteTask pendiente | ✅ | ✅ | 🔲 Sin UI real |
| Clientes | ⚠️ Sin delete, sin queries listado | ✅ | ✅ | 🔲 Sin UI real |
| Finanzas | ⚠️ Sin CRUD de cuentas | ✅ | ✅ | 🔲 Sin UI real |
| Notas | ⚠️ Sin NoteProject/NoteTag | ✅ | ✅ | 🔲 Sin UI real |
| Cuentas | ❌ Sin actions | — | ✅ | 🔲 Sin UI real |
| Categorías | ❌ Sin actions | — | — | 🔲 Sin UI real |
| Metas (Goals) | ❌ Sin implementar | — | — | 🔲 Sin UI real |
| Dashboard | ❌ Sin datos | — | — | 🔲 Stub |
| Sidebar | ⚠️ Props ignoradas | — | — | ⚠️ Render básico |

---

## Lo que falta (priorizado)

### Alta prioridad — desbloquea UX
1. **Sidebar** — mostrar workspaces reales con navegación (usa `getWorkspacesWithMetrics()` ya implementado)
2. **Página `/workspace/[id]`** — overview con métricas (usa queries existentes)
3. **Página `/workspace/[id]/projects`** — lista + form create (usa `getProjectsByWorkspace()` + `createProject()`)
4. **Página `/workspace/[id]/projects/[pid]`** — Kanban con tareas (usa `getTasksByProject()` + `updateTaskStatus()`)
5. **Página `/accounts`** — CRUD de cuentas (necesita `createAccount()`, `getAccountsByUser()`)

### Media prioridad — completa features
6. **Página `/workspace/[id]/finances`** — transacciones + resumen (usa queries existentes)
7. **Página `/workspace/[id]/clients`** — lista + CRUD (necesita `getClientsByWorkspace()`)
8. **Páginas de notas** — `/library` y `/workspace/[id]/notes` (usa queries existentes, integrar Tiptap)
9. **`deleteTask()`** — completar el TODO
10. **`deleteClient()`**, **`deleteTransaction()`** — acciones faltantes

### Baja prioridad — funcionalidad avanzada
11. **NoteProject** — vincular notas a proyectos (tabla existe, sin actions)
12. **NoteTag / TransactionTag** — sistema de tags (tablas existen, sin actions)
13. **WorkspaceGoal** — metas mensuales por workspace (R13, sin implementar)
14. **Dashboard global** — métricas cross-workspace
15. **WorkspaceSwitcher** — dropdown para cambiar workspace desde el sidebar

---

## Reglas de negocio — estado de implementación

| Regla | Descripción | Implementada en |
|---|---|---|
| R1 | `clientId XOR categoryId` en Project | `validations/project.ts` refine |
| R2 | Proyecto `isGeneral` no eliminable | `project/actions.ts` deleteProject |
| R3 | Exactamente 1 `isGeneral` por workspace | `workspace/actions.ts` createWorkspace |
| R4 | Nota local solo vincula proyectos del mismo ws | `note/actions.ts` createNote |
| R5 | Nota global vincula proyectos de cualquier ws | `note/actions.ts` createNote |
| R6 | Tag local solo usable en su workspace | ❌ Sin implementar |
| R7 | Eliminar workspace → cascada | Prisma schema + `workspace/actions.ts` |
| R8 | Cuentas/notas globales sobreviven | Prisma schema (no cascade) |
| R9 | InstallmentGroup genera N SCHEDULED | `finance/actions.ts` createInstallmentGroup |
| R10 | balance = initialBalance + Σincome - Σexpense | `finance/actions.ts` recalculateBalance |
| R11 | TRANSFER = 2 transactions atómicas | `finance/actions.ts` createTransaction |
| R12 | Solo EXECUTED impacta resúmenes | `finance/queries.ts` getMonthlySummary |
| R13 | WorkspaceGoal por workspace y mes | ❌ Sin implementar |
| R14 | SCHEDULED → EXECUTED via cron | `api/cron/route.ts` |
| R15 | Crear workspace → auto-crea Project General | `workspace/actions.ts` createWorkspace |
| R16 | Usuario puede tener N workspaces | Soportado por schema |
| R17 | Desactivar workspace = `isActive=false` | ❌ Sin implementar (deleteWorkspace elimina) |
