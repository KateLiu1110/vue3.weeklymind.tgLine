-- AlterTable
ALTER TABLE "User" ADD COLUMN     "goalTitle" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reminded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "moduleLabel" TEXT NOT NULL,
    "tagBg" TEXT NOT NULL DEFAULT 'bg-cream-175',
    "tagCol" TEXT NOT NULL DEFAULT 'text-clay-500',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "due" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FocusTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sub" TEXT NOT NULL DEFAULT '',
    "badgeText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmallAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmallAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Schedule_userId_idx" ON "Schedule"("userId");

-- CreateIndex
CREATE INDEX "FocusTask_userId_idx" ON "FocusTask"("userId");

-- CreateIndex
CREATE INDEX "GrowthGoal_userId_idx" ON "GrowthGoal"("userId");

-- CreateIndex
CREATE INDEX "SmallAchievement_userId_idx" ON "SmallAchievement"("userId");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTask" ADD CONSTRAINT "FocusTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthGoal" ADD CONSTRAINT "GrowthGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmallAchievement" ADD CONSTRAINT "SmallAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
