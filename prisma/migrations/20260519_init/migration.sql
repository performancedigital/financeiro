-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PERSONAL_HELBERT', 'HOUSEHOLD', 'PERSONAL_LEIDIANE', 'BUSINESS_AGENCY', 'TRAVEL_EXTRA', 'DEBT', 'REIMBURSEMENT', 'WORKING_CAPITAL');

-- CreateEnum
CREATE TYPE "FinancialInstitution" AS ENUM ('SICOOB', 'NUBANK', 'CAIXA', 'BRADESCO', 'MERCADO_PAGO', 'INFINITEPAY', 'COMPANY_ACCOUNT', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'STANDBY', 'DELINQUENT', 'CANCELED', 'PROSPECT');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('OTHER');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELED', 'RENEGOTIATED');

-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('OPEN', 'PAID', 'OVERDUE', 'INSTALMENT', 'RENEGOTIATED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PayableType" AS ENUM ('FIXED', 'VARIABLE', 'RECURRING', 'EXTRAORDINARY', 'DEBT', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('ONE_TIME');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "institution" "FinancialInstitution" NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isIncome" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyContract" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "services" "ServiceType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "monthlyValue" DECIMAL(65,30) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "services" "ServiceType"[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "transactionAt" TIMESTAMP(3) NOT NULL,
    "competency" TIMESTAMP(3) NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "institution" "FinancialInstitution" NOT NULL,
    "accountId" TEXT,
    "categoryId" TEXT,
    "costCenterId" TEXT,
    "clientId" TEXT,
    "duplicateHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receivable" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contractId" TEXT,
    "competency" TIMESTAMP(3) NOT NULL,
    "expectedAmount" DECIMAL(65,30) NOT NULL,
    "receivedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "status" "ReceivableStatus" NOT NULL DEFAULT 'PENDING',
    "accountId" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payable" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "providerId" TEXT,
    "categoryId" TEXT,
    "costCenterId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PayableStatus" NOT NULL DEFAULT 'OPEN',
    "type" "PayableType" NOT NULL,
    "accountId" TEXT,
    "recurrence" "RecurrenceType" NOT NULL DEFAULT 'ONE_TIME',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_workspaceId_slug_key" ON "Category"("workspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_workspaceId_name_key" ON "CostCenter"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_workspaceId_name_key" ON "Provider"("workspaceId", "name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;