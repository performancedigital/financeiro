CREATE TABLE IF NOT EXISTS "Debt" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LOAN',
    "originalAmount" DECIMAL(65,30) NOT NULL,
    "outstandingAmount" DECIMAL(65,30) NOT NULL,
    "monthlyRate" DECIMAL(65,30),
    "dueDate" TIMESTAMP(3),
    "totalInstalments" INTEGER,
    "paidInstalments" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ON_TIME',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "url" TEXT,
    "clientId" TEXT,
    "amount" DECIMAL(65,30),
    "documentDate" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Debt" ADD CONSTRAINT "Debt_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
