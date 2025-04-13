-- CreateTable
CREATE TABLE "MindMapTag" (
    "mindMapId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "MindMapTag_pkey" PRIMARY KEY ("mindMapId","tagId")
);

-- CreateIndex
CREATE INDEX "MindMapTag_tagId_idx" ON "MindMapTag"("tagId");

-- AddForeignKey
ALTER TABLE "MindMapTag" ADD CONSTRAINT "MindMapTag_mindMapId_fkey" FOREIGN KEY ("mindMapId") REFERENCES "MindMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapTag" ADD CONSTRAINT "MindMapTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
