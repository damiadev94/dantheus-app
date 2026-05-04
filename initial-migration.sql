// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE GESTIÓN PERSONAL — Schema completo
// Para importar: dbdiagram.io → Import → DBML
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// GLOBALES DEL USUARIO
// ══════════════════════════════════════════════════════════════════════════════

Table user {
  id            uuid        [pk, default: `gen_random_uuid()`]
  email         varchar     [unique, not null]
  password_hash varchar     [not null]
  name          varchar     [not null]
  avatar_url    varchar     
  created_at    timestamp   [default: `now()`]
  updated_at    timestamp   [default: `now()`]
}

Table account {
  id              uuid        [pk, default: `gen_random_uuid()`]
  user_id         uuid        [not null, ref: > user.id]
  name            varchar     [not null]
  type            account_type [not null]
  currency        varchar     [not null, note: 'ISO 4217: ARS, USD, EUR']
  initial_balance decimal(12,2) [not null, default: 0]
  current_balance decimal(12,2) [not null, default: 0, note: 'Calculado: initial_balance + SUM(executed)']
  color           varchar     
  icon            varchar     
  is_active       boolean     [default: true]
  created_at      timestamp   [default: `now()`]
  updated_at      timestamp   [default: `now()`]

  Note: 'Global del usuario. Los movimientos son locales al workspace.'
}

Table category {
  id         uuid      [pk, default: `gen_random_uuid()`]
  user_id    uuid      [not null, ref: > user.id]
  name       varchar   [not null]
  color      varchar   
  icon       varchar   
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  Note: 'Global del usuario. Categorías de proyectos propios: SaaS, YouTube, Blog...'
}

Table note {
  id              uuid          [pk, default: `gen_random_uuid()`]
  user_id         uuid          [ref: > user.id, note: 'NULL si scope=local']
  workspace_id    uuid          [ref: > workspace.id, note: 'NULL si scope=global']
  title           varchar       [not null]
  content         json          [note: 'Rich text en formato Tiptap JSON']
  type            note_type     [not null]
  scope           scope_type    [not null]
  status          note_status   [not null, default: 'active']
  url             varchar       [note: 'Para recursos externos: artículos, videos, docs']
  learning_status learning_status_type [note: 'Solo aplica si type=resource|learning (R19)']
  created_at      timestamp     [default: `now()`]
  updated_at      timestamp     [default: `now()`]

  Note: 'Un solo modelo para nota, recurso y aprendizaje. scope determina visibilidad.'
}

Table tag {
  id           uuid       [pk, default: `gen_random_uuid()`]
  user_id      uuid       [ref: > user.id, note: 'Presente si scope=global']
  workspace_id uuid       [ref: > workspace.id, note: 'Presente si scope=local']
  name         varchar    [not null]
  color        varchar    
  scope        scope_type [not null]
  created_at   timestamp  [default: `now()`]
  updated_at   timestamp  [default: `now()`]

  Note: 'Global o local según scope. Solo uno de user_id/workspace_id está presente.'
}

// ══════════════════════════════════════════════════════════════════════════════
// LOCALES DEL WORKSPACE
// ══════════════════════════════════════════════════════════════════════════════

Table workspace {
  id          uuid      [pk, default: `gen_random_uuid()`]
  user_id     uuid      [not null, ref: > user.id]
  name        varchar   [not null]
  description varchar   
  color       varchar   
  icon        varchar   
  is_active   boolean   [default: true]
  created_at  timestamp [default: `now()`]
  updated_at  timestamp [default: `now()`]

  Note: 'Al crearse genera automáticamente un Project{is_general:true} (R15).'
}

Table client {
  id           uuid      [pk, default: `gen_random_uuid()`]
  workspace_id uuid      [not null, ref: > workspace.id]
  name         varchar   [not null]
  email        varchar   
  phone        varchar   
  notes        text      
  is_active    boolean   [default: true]
  created_at   timestamp [default: `now()`]
  updated_at   timestamp [default: `now()`]
}

Table project {
  id              uuid           [pk, default: `gen_random_uuid()`]
  workspace_id    uuid           [not null, ref: > workspace.id]
  client_id       uuid           [ref: > client.id, note: 'NULL si proyecto propio (R1: XOR con category_id)']
  category_id     uuid           [ref: > category.id, note: 'NULL si proyecto de cliente (R1: XOR con client_id)']
  name            varchar        [not null]
  description     text           
  status          project_status [not null, default: 'idea']
  start_date      date           
  end_date        date           
  budget          decimal(12,2)  
  budget_currency varchar        
  is_general      boolean        [default: false, note: 'R2: indestructible. R3: exactamente 1 por workspace.']
  created_at      timestamp      [default: `now()`]
  updated_at      timestamp      [default: `now()`]

  Note: 'client_id XOR category_id. Si is_general=true, ambos son NULL.'
}

Table task {
  id          uuid          [pk, default: `gen_random_uuid()`]
  project_id  uuid          [not null, ref: > project.id]
  title       varchar       [not null]
  description text          
  status      task_status   [not null, default: 'pending']
  priority    task_priority [not null, default: 'medium']
  due_date    date          
  order       int           [default: 0, note: 'Para drag & drop en la UI']
  created_at  timestamp     [default: `now()`]
  updated_at  timestamp     [default: `now()`]
}

Table transaction {
  id            uuid              [pk, default: `gen_random_uuid()`]
  workspace_id  uuid              [not null, ref: > workspace.id]
  account_id    uuid              [not null, ref: > account.id]
  project_id    uuid              [ref: > project.id, note: 'Opcional: vincula el movimiento a un proyecto']
  type          transaction_type  [not null]
  amount        decimal(12,2)     [not null]
  currency      varchar           [not null, note: 'Hereda de la cuenta']
  description   varchar           
  date          date              [not null]
  status        transaction_status [not null, default: 'executed']
  is_recurring  boolean           [default: false]
  recurrence_id uuid              [ref: > installment_group.id, note: 'NULL si no es parte de un grupo de cuotas']
  created_at    timestamp         [default: `now()`]
  updated_at    timestamp         [default: `now()`]

  Note: 'R10: solo executed impacta balance. R11: transfer genera 2 transactions. R14: scheduled se ejecuta automáticamente.'
}

Table installment_group {
  id                uuid      [pk, default: `gen_random_uuid()`]
  workspace_id      uuid      [not null, ref: > workspace.id]
  account_id        uuid      [not null, ref: > account.id]
  description       varchar   [not null]
  total_amount      decimal(12,2) [not null]
  installment_count int       [not null]
  start_date        date      [not null]
  created_at        timestamp [default: `now()`]

  Note: 'R9: al crearse genera N transactions con status=scheduled. R14: se ejecutan automáticamente.'
}

Table workspace_goal {
  id             uuid          [pk, default: `gen_random_uuid()`]
  workspace_id   uuid          [not null, ref: > workspace.id]
  period         varchar       [not null, note: 'Formato YYYY-MM. Ej: 2025-05']
  income_target  decimal(12,2) [note: 'Meta de ingreso mensual']
  expense_limit  decimal(12,2) [note: 'Límite de gasto mensual']
  savings_target decimal(12,2) [note: 'Meta de ahorro mensual']
  created_at     timestamp     [default: `now()`]
  updated_at     timestamp     [default: `now()`]

  indexes {
    (workspace_id, period) [unique, name: 'uq_workspace_goal_period']
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TABLAS DE RELACIÓN (N:M)
// ══════════════════════════════════════════════════════════════════════════════

Table note_project {
  note_id    uuid      [not null, ref: > note.id]
  project_id uuid      [not null, ref: > project.id]
  created_at timestamp [default: `now()`]

  indexes {
    (note_id, project_id) [pk]
  }

  Note: 'R4: nota local solo vincula proyectos del mismo workspace. R5: nota global vincula cualquier proyecto del usuario.'
}

Table note_tag {
  note_id uuid [not null, ref: > note.id]
  tag_id  uuid [not null, ref: > tag.id]

  indexes {
    (note_id, tag_id) [pk]
  }
}

Table transaction_tag {
  transaction_id uuid [not null, ref: > transaction.id]
  tag_id         uuid [not null, ref: > tag.id]

  indexes {
    (transaction_id, tag_id) [pk]
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════════════

Enum account_type {
  cash
  bank
  digital_wallet
  credit
  investment
}

Enum note_type {
  note
  resource
  learning
}

Enum scope_type {
  global
  local
}

Enum note_status {
  active
  archived
}

Enum learning_status_type {
  pending
  in_progress
  completed
}

Enum project_status {
  idea
  active
  paused
  closed
}

Enum task_status {
  pending
  in_progress
  done
  cancelled
}

Enum task_priority {
  low
  medium
  high
}

Enum transaction_type {
  income
  expense
  transfer
}

Enum transaction_status {
  executed
  scheduled
}
