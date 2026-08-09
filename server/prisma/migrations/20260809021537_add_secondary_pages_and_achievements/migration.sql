-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "caption" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SavedLink" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ToeicProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalTitle" TEXT NOT NULL DEFAULT '多益目標 600 分',
    "goalDesc" TEXT NOT NULL DEFAULT '',
    "classSchedule" TEXT NOT NULL DEFAULT '',
    "lastMockScore" INTEGER NOT NULL DEFAULT 0,
    "targetScore" INTEGER NOT NULL DEFAULT 0,
    "scoreTrend" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToeicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToeicExamDate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToeicExamDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToeicTaskItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'goal',
    "todayLabel" TEXT NOT NULL DEFAULT '',
    "pct" INTEGER NOT NULL DEFAULT 0,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToeicTaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportCategoryTab" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportCategoryTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportTodoItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportTodoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetroGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "totalDays" INTEGER,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetroGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToeicProfile_userId_key" ON "ToeicProfile"("userId");

-- CreateIndex
CREATE INDEX "ToeicExamDate_userId_idx" ON "ToeicExamDate"("userId");

-- CreateIndex
CREATE INDEX "ToeicTaskItem_userId_idx" ON "ToeicTaskItem"("userId");

-- CreateIndex
CREATE INDEX "SportCategoryTab_userId_idx" ON "SportCategoryTab"("userId");

-- CreateIndex
CREATE INDEX "SportTodoItem_userId_idx" ON "SportTodoItem"("userId");

-- CreateIndex
CREATE INDEX "RetroGoal_userId_idx" ON "RetroGoal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_key_key" ON "Achievement"("userId", "key");

-- AddForeignKey
ALTER TABLE "ToeicProfile" ADD CONSTRAINT "ToeicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToeicExamDate" ADD CONSTRAINT "ToeicExamDate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToeicTaskItem" ADD CONSTRAINT "ToeicTaskItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportCategoryTab" ADD CONSTRAINT "SportCategoryTab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportTodoItem" ADD CONSTRAINT "SportTodoItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetroGoal" ADD CONSTRAINT "RetroGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
