-- CreateTable
CREATE TABLE "PlanCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanCheckin_userId_idx" ON "PlanCheckin"("userId");

-- AddForeignKey
ALTER TABLE "PlanCheckin" ADD CONSTRAINT "PlanCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanCheckin" ADD CONSTRAINT "PlanCheckin_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
