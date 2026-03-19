import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  date,
  timestamp,
  index,
  uniqueIndex
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
})

/**
 * ACCOUNTS
 */
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 40 }),
  type: integer('type'),

  ...timestamps
}, (table) => ({
  idIdx: index('accounts_id_idx').on(table.id)
}))

/**
 * CATEGORIES
 */
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 40 }).notNull(),
  type: integer('type'),

  ...timestamps
})

/**
 * PERIODS
 */
export const periods = pgTable('periods', {
  id: uuid('id').primaryKey(),
  basedate: date('basedate').notNull(),
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
 * BUDGET
 */
export const budget = pgTable('budget', {
  id: uuid('id').primaryKey(),

  amount: numeric('amount', { precision: 10, scale: 2 })
    .default('0')
    .notNull(),

  category: uuid('category')
    .notNull()
    .references(() => categories.id),

  account: uuid('account')
    .notNull()
    .references(() => accounts.id),

  period: uuid('period')
    .notNull()
    .references(() => periods.id),

  ...timestamps
})

/**
 * TRANSACTIONS
 */
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey(),

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