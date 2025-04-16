/*
  Warnings:

  - You are about to drop the column `sondEffect` on the `PomodoroSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PomodoroSetting" DROP COLUMN "sondEffect",
ADD COLUMN     "soundEffect" "SoundEffect" NOT NULL DEFAULT 'ANALOG';
