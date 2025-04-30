/*
  Warnings:

  - You are about to drop the column `from` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "date" TIMESTAMP(3);
