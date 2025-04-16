-- CreateEnum
CREATE TYPE "SoundEffect" AS ENUM ('ANALOG', 'BIRD', 'CHURCH_BELL', 'DIGITAL', 'FANCY', 'BELL');

-- AlterTable
ALTER TABLE "PomodoroSetting" ADD COLUMN     "sondEffect" "SoundEffect" NOT NULL DEFAULT 'ANALOG',
ADD COLUMN     "soundEffectVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
