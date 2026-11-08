import { sql } from 'drizzle-orm'
import {
  pgTable,
  uuid,
  varchar,
  integer,
  smallint,
  bigint,
  numeric,
  date,
  timestamp,
  index,
  uniqueIndex,
  check
} from 'drizzle-orm/pg-core'

/**
 * Campos padrão reutilizáveis
 */
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}

/**
 * USERS
 */
export const users = pgTable('Users', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  password: varchar('password', { length: 161 }).notNull(),
  role: varchar('role', { length: 15 }).notNull(),
  login: varchar('login', { length: 50 }).notNull(),

  ...timestamps
}, (table) => ({
  loginUq: uniqueIndex('users_login_uq').on(table.login)
}))

/**
 * ACCOUNTS
 */
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 40 }),
  type: integer('type'),

  ...timestamps
}, (table) => ({
  idIdx: index('accounts_id_idx').on(table.id)
}))

/**
 * CATEGORY GROUPS
 * kind: RECEITA ou DESPESA. result_class (só despesa): TRABALHO, BASICO ou INVESTIMENTO,
 * e define em que linha do Resultado a categoria entra.
 */
export const categoryGroups = pgTable('category_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 40 }).notNull(),
  kind: varchar('kind', { length: 10 }).notNull(),
  resultClass: varchar('result_class', { length: 15 }),
  sortOrder: integer('sort_order').notNull().default(0),
  archivedAt: timestamp('archived_at'),

  ...timestamps
}, (table) => ({
  userNameUq: uniqueIndex('category_groups_user_name_uq').on(table.userId, table.name),
  kindCk: check('category_groups_kind_ck', sql`${table.kind} in ('RECEITA', 'DESPESA')`),
  resultClassCk: check('category_groups_result_class_ck', sql`(${table.kind} = 'RECEITA' and ${table.resultClass} is null) or (${table.kind} = 'DESPESA' and ${table.resultClass} in ('TRABALHO', 'BASICO', 'INVESTIMENTO'))`)
}))

/**
 * CATEGORIES
 * A identidade é o id: o mesmo nome pode existir em grupos diferentes ("Outros").
 */
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  groupId: uuid('group_id').notNull().references(() => categoryGroups.id),
  name: varchar('name', { length: 40 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  archivedAt: timestamp('archived_at'),

  ...timestamps
}, (table) => ({
  groupNameUq: uniqueIndex('categories_group_name_uq').on(table.groupId, table.name),
  userIdx: index('categories_user_idx').on(table.userId)
}))

/**
 * PERIODS
 */
export const periods = pgTable('periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  description: varchar('description', { length: 40 }),

  account: uuid('account').references(() => accounts.id),

  initialDate: date('initial_date').notNull(),
  finalDate: date('final_date'),

  ...timestamps
}, (table) => ({
  uniqueAccountPeriod: uniqueIndex('periods_account_initial_date_uq')
    .on(table.account, table.initialDate)
}))

/**
 * BUDGET ITEMS
 * Orçado de uma categoria num mês do calendário, em centavos. Sem linha = sem orçado.
 */
export const budgetItems = pgTable('budget_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  year: smallint('year').notNull(),
  month: smallint('month').notNull(),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),

  ...timestamps
}, (table) => ({
  userCategoryMonthUq: uniqueIndex('budget_items_user_category_year_month_uq').on(table.userId, table.categoryId, table.year, table.month),
  userYearIdx: index('budget_items_user_year_idx').on(table.userId, table.year),
  monthCk: check('budget_items_month_ck', sql`${table.month} between 1 and 12`),
  yearCk: check('budget_items_year_ck', sql`${table.year} between 2000 and 2100`),
  amountCk: check('budget_items_amount_ck', sql`${table.amountCents} >= 0`)
}))

/**
 * BUDGET NOTES
 * Comentário de uma célula do orçamento (categoria + ano + mês). Separado de budget_items: pode existir
 * comentário sem valor, e remover o valor não apaga o comentário. Some junto com a categoria.
 */
export const budgetNotes = pgTable('budget_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  year: smallint('year').notNull(),
  month: smallint('month').notNull(),
  note: varchar('note', { length: 500 }).notNull(),

  ...timestamps
}, (table) => ({
  userCategoryMonthUq: uniqueIndex('budget_notes_user_category_year_month_uq').on(table.userId, table.categoryId, table.year, table.month),
  userYearIdx: index('budget_notes_user_year_idx').on(table.userId, table.year),
  monthCk: check('budget_notes_month_ck', sql`${table.month} between 1 and 12`),
  yearCk: check('budget_notes_year_ck', sql`${table.year} between 2000 and 2100`),
  noteCk: check('budget_notes_note_ck', sql`length(trim(${table.note})) > 0`)
}))

/**
 * TRANSACTIONS
 */
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),

  date: date('date').notNull(),

  amount: numeric('amount', { precision: 10, scale: 2 })
    .default('0')
    .notNull(),

  account: uuid('account')
    .notNull()
    .references(() => accounts.id),

  category: uuid('category')
    .notNull()
    .references(() => categories.id),

  period: uuid('period')
    .notNull()
    .references(() => periods.id),

  ...timestamps
}, (table) => ({
  compositeIdx: index('transactions_account_period_category_idx')
    .on(table.account, table.period, table.category)
}))
