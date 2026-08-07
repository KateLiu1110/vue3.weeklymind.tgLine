-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sub" TEXT NOT NULL DEFAULT '',
    "pct" INTEGER NOT NULL DEFAULT 0,
    "checkinsDone" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "weekdays" JSONB NOT NULL DEFAULT [],
    "startTime" TEXT NOT NULL DEFAULT '',
    "endTime" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT,
    "targetDate" TEXT,
    "linkedCustomId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tagBg" TEXT NOT NULL,
    "tagCol" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
