/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `WorkSpace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminCode]` on the table `WorkSpace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[canEditCode]` on the table `WorkSpace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[readOnlyCode]` on the table `WorkSpace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminCode` to the `WorkSpace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `canEditCode` to the `WorkSpace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviteCode` to the `WorkSpace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readOnlyCode` to the `WorkSpace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkSpace" ADD COLUMN     "adminCode" TEXT NOT NULL,
ADD COLUMN     "canEditCode" TEXT NOT NULL,
ADD COLUMN     "inviteCode" TEXT NOT NULL,
ADD COLUMN     "readOnlyCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WorkSpace_inviteCode_key" ON "WorkSpace"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSpace_adminCode_key" ON "WorkSpace"("adminCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSpace_canEditCode_key" ON "WorkSpace"("canEditCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSpace_readOnlyCode_key" ON "WorkSpace"("readOnlyCode");
