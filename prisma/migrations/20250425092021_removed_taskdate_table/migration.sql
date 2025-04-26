/*
  Warnings:

  - You are about to drop the column `dateId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskDate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_dateId_fkey";

-- DropIndex
DROP INDEX "Task_creatorId_idx";

-- DropIndex
DROP INDEX "Task_updatedUserId_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "dateId",
ADD COLUMN     "from" TIMESTAMP(3),
ADD COLUMN     "to" TIMESTAMP(3);

-- DropTable
DROP TABLE "TaskDate";
