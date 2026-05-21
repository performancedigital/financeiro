-- Criar tabela WorkspaceOption
CREATE TABLE "WorkspaceOption" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkspaceOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkspaceOption_workspaceId_kind_value_key" ON "WorkspaceOption"("workspaceId", "kind", "value");
CREATE INDEX "WorkspaceOption_workspaceId_kind_idx" ON "WorkspaceOption"("workspaceId", "kind");

ALTER TABLE "WorkspaceOption" ADD CONSTRAINT "WorkspaceOption_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Alterar Account.type de enum para TEXT
ALTER TABLE "Account" ALTER COLUMN "type" TYPE TEXT;

-- Alterar Account.institution de enum para TEXT
ALTER TABLE "Account" ALTER COLUMN "institution" TYPE TEXT;

-- Alterar Transaction.accountType de enum para TEXT
ALTER TABLE "Transaction" ALTER COLUMN "accountType" TYPE TEXT;

-- Alterar Transaction.institution de enum para TEXT
ALTER TABLE "Transaction" ALTER COLUMN "institution" TYPE TEXT;

-- Remover enums (só se não tiverem outros usos - ignorar erros se já removidos)
DROP TYPE IF EXISTS "AccountType";
DROP TYPE IF EXISTS "FinancialInstitution";
