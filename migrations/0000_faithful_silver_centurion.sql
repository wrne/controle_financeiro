-- =========================================
-- EXTENSÃO PARA UUID
-- =========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- TABELAS
-- =========================================

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(40),
  type integer,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(40) NOT NULL,
  type integer,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  basedate date NOT NULL,
  description varchar(40),
  account uuid,
  initial_date date NOT NULL,
  final_date date,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),

  CONSTRAINT periods_account_fk
    FOREIGN KEY (account) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  category uuid NOT NULL,
  account uuid NOT NULL,
  period uuid NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),

  CONSTRAINT budget_category_fk FOREIGN KEY (category) REFERENCES categories(id),
  CONSTRAINT budget_account_fk FOREIGN KEY (account) REFERENCES accounts(id),
  CONSTRAINT budget_period_fk FOREIGN KEY (period) REFERENCES periods(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  account uuid NOT NULL,
  category uuid NOT NULL,
  period uuid NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),

  CONSTRAINT transactions_account_fk FOREIGN KEY (account) REFERENCES accounts(id),
  CONSTRAINT transactions_category_fk FOREIGN KEY (category) REFERENCES categories(id),
  CONSTRAINT transactions_period_fk FOREIGN KEY (period) REFERENCES periods(id)
);

-- =========================================
-- ÍNDICES
-- =========================================

CREATE UNIQUE INDEX IF NOT EXISTS periods_account_initial_date_uq
ON periods (account, initial_date);

CREATE INDEX IF NOT EXISTS transactions_account_period_category_idx
ON transactions (account, period, category);

-- =========================================
-- FUNÇÃO PARA updated_at
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGERS
-- =========================================

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_periods_updated_at ON periods;
CREATE TRIGGER update_periods_updated_at
BEFORE UPDATE ON periods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_updated_at ON budget;
CREATE TRIGGER update_budget_updated_at
BEFORE UPDATE ON budget
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();