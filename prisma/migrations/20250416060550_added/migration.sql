-- CreateTable
CREATE TABLE "AssignedToTask" (
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AssignedToTask_pkey" PRIMARY KEY ("userId","taskId")
);

-- CreateTable
CREATE TABLE "AssignedToMindmap" (
    "userId" INTEGER NOT NULL,
    "mindmapId" INTEGER NOT NULL,

    CONSTRAINT "AssignedToMindmap_pkey" PRIMARY KEY ("userId","mindmapId")
);

-- CreateIndex
CREATE INDEX "AssignedToTask_userId_taskId_idx" ON "AssignedToTask"("userId", "taskId");

-- CreateIndex
CREATE INDEX "AssignedToMindmap_userId_mindmapId_idx" ON "AssignedToMindmap"("userId", "mindmapId");

-- AddForeignKey
ALTER TABLE "AssignedToTask" ADD CONSTRAINT "AssignedToTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedToTask" ADD CONSTRAINT "AssignedToTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedToMindmap" ADD CONSTRAINT "AssignedToMindmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedToMindmap" ADD CONSTRAINT "AssignedToMindmap_mindmapId_fkey" FOREIGN KEY ("mindmapId") REFERENCES "MindMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
