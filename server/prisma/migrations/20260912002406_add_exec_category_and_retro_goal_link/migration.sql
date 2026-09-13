-- AlterTable
ALTER TABLE "RetroGoal" ADD COLUMN     "linkedPlanId" TEXT;

-- CreateTable
CREATE TABLE "ExecCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecCategory_userId_idx" ON "ExecCategory"("userId");

-- AddForeignKey
ALTER TABLE "ExecCategory" ADD CONSTRAINT "ExecCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
