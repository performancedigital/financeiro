-- ============================================================
-- MIGRAÇÃO COMPLETA — rodar uma vez no SQL Editor do Supabase
-- ============================================================

-- 1. Criar tabela User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_workspaceId_fkey'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey"
      FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. Criar tabela WorkspaceOption
CREATE TABLE IF NOT EXISTS "WorkspaceOption" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "WorkspaceOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceOption_workspaceId_kind_value_key"
  ON "WorkspaceOption"("workspaceId", "kind", "value");

CREATE INDEX IF NOT EXISTS "WorkspaceOption_workspaceId_kind_idx"
  ON "WorkspaceOption"("workspaceId", "kind");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'WorkspaceOption_workspaceId_fkey'
  ) THEN
    ALTER TABLE "WorkspaceOption" ADD CONSTRAINT "WorkspaceOption_workspaceId_fkey"
      FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Converter Account.type de enum para TEXT (USING obrigatório no PostgreSQL)
ALTER TABLE "Account" ALTER COLUMN "type" TYPE TEXT USING "type"::text;

-- 4. Converter Account.institution de enum para TEXT
ALTER TABLE "Account" ALTER COLUMN "institution" TYPE TEXT USING "institution"::text;

-- 5. Converter Transaction.accountType de enum para TEXT
ALTER TABLE "Transaction" ALTER COLUMN "accountType" TYPE TEXT USING "accountType"::text;

-- 6. Converter Transaction.institution de enum para TEXT
ALTER TABLE "Transaction" ALTER COLUMN "institution" TYPE TEXT USING "institution"::text;

-- 7. Remover enums antigos (seguro, dados já foram convertidos)
DROP TYPE IF EXISTS "AccountType";
DROP TYPE IF EXISTS "FinancialInstitution";
