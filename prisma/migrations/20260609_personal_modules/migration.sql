-- Investment
CREATE TABLE IF NOT EXISTS "Investment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "investedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- Goal
CREATE TABLE IF NOT EXISTS "Goal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "targetAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- Budget
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "limitAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Investment_workspaceId_idx" ON "Investment"("workspaceId");
CREATE INDEX IF NOT EXISTS "Goal_workspaceId_idx" ON "Goal"("workspaceId");
CREATE INDEX IF NOT EXISTS "Budget_workspaceId_idx" ON "Budget"("workspaceId");
CREATE UNIQUE INDEX IF NOT EXISTS "Budget_workspaceId_category_key" ON "Budget"("workspaceId", "category");

ALTER TABLE "Investment" ADD CONSTRAINT "Investment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
