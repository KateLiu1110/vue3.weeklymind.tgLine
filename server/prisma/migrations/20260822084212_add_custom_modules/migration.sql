-- CreateTable
CREATE TABLE "CustomModule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT '',
    "heroDesc" TEXT NOT NULL DEFAULT '',
    "heroSchedule" TEXT NOT NULL DEFAULT '',
    "heroCurrent" TEXT NOT NULL DEFAULT '0',
    "heroTarget" TEXT NOT NULL DEFAULT '',
    "examTitle" TEXT NOT NULL DEFAULT '考試天數',
    "scoreTitle" TEXT NOT NULL DEFAULT '分數紀錄',
    "lastLabel" TEXT NOT NULL DEFAULT '',
    "lastScore" TEXT NOT NULL DEFAULT '',
    "targetLabel" TEXT NOT NULL DEFAULT '',
    "targetScore" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomModuleDailyTask" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomModuleDailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomModuleScore" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomModuleScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomModuleExamDate" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomModuleExamDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBoardColumn" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomBoardColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBoardItem" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomBoardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTabCategory" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomTabCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTabItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomTabItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomModule_userId_idx" ON "CustomModule"("userId");

-- CreateIndex
CREATE INDEX "CustomModuleDailyTask_moduleId_idx" ON "CustomModuleDailyTask"("moduleId");

-- CreateIndex
CREATE INDEX "CustomModuleScore_moduleId_idx" ON "CustomModuleScore"("moduleId");

-- CreateIndex
CREATE INDEX "CustomModuleExamDate_moduleId_idx" ON "CustomModuleExamDate"("moduleId");

-- CreateIndex
CREATE INDEX "CustomBoardColumn_moduleId_idx" ON "CustomBoardColumn"("moduleId");

-- CreateIndex
CREATE INDEX "CustomBoardItem_columnId_idx" ON "CustomBoardItem"("columnId");

-- CreateIndex
CREATE INDEX "CustomTabCategory_moduleId_idx" ON "CustomTabCategory"("moduleId");

-- CreateIndex
CREATE INDEX "CustomTabItem_categoryId_idx" ON "CustomTabItem"("categoryId");

-- AddForeignKey
ALTER TABLE "CustomModule" ADD CONSTRAINT "CustomModule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomModuleDailyTask" ADD CONSTRAINT "CustomModuleDailyTask_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CustomModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomModuleScore" ADD CONSTRAINT "CustomModuleScore_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CustomModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomModuleExamDate" ADD CONSTRAINT "CustomModuleExamDate_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CustomModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBoardColumn" ADD CONSTRAINT "CustomBoardColumn_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CustomModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBoardItem" ADD CONSTRAINT "CustomBoardItem_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "CustomBoardColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTabCategory" ADD CONSTRAINT "CustomTabCategory_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CustomModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTabItem" ADD CONSTRAINT "CustomTabItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CustomTabCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
