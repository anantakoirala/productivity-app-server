-- CreateTable
CREATE TABLE "PomodoroSetting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "workDuration" INTEGER NOT NULL DEFAULT 25,
    "shortBreakDuration" INTEGER NOT NULL DEFAULT 5,
    "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
    "longBreakinterval" INTEGER NOT NULL DEFAULT 2,
    "rounds" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "PomodoroSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PomodoroSetting_userId_idx" ON "PomodoroSetting"("userId");

-- AddForeignKey
ALTER TABLE "PomodoroSetting" ADD CONSTRAINT "PomodoroSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
