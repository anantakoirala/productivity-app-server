-- CreateEnum
CREATE TYPE "UserPermission" AS ENUM ('ADMIN', 'CAN_EDIT', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "UseCase" AS ENUM ('WORK', 'STUDY', 'PERSONAL_USE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "useCase" "UseCase";

-- CreateTable
CREATE TABLE "WorkSpace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "WorkSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "useRole" "UserPermission" NOT NULL DEFAULT 'READ_ONLY',

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateIndex
CREATE INDEX "WorkSpace_userId_idx" ON "WorkSpace"("userId");

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_idx" ON "Subscription"("workspaceId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "WorkSpace" ADD CONSTRAINT "WorkSpace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "WorkSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
