import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Wipes all business/content tables but keeps the "User" table intact
// (accounts + LINE bindings survive). Run backup-db.ts first.
const tablesToWipe = [
  "Plan",
  "Milestone",
  "LinkRule",
  "SavedLink",
  "SportLog",
  "ToeicProgress",
  "Project",
  "DailyTask",
  "ToeicProfile",
  "ToeicExamDate",
  "ToeicTaskItem",
  "SportCategoryTab",
  "SportTodoItem",
  "RetroGoal",
  "Achievement",
  "Schedule",
  "FocusTask",
  "GrowthGoal",
  "SmallAchievement",
  "CustomModule",
  "CustomModuleDailyTask",
  "CustomModuleScore",
  "CustomModuleExamDate",
  "CustomBoardColumn",
  "CustomBoardItem",
  "CustomTabCategory",
  "CustomTabItem",
];

async function main() {
  const quoted = tablesToWipe.map((t) => `"${t}"`).join(", ");
  console.log("Truncating:", tablesToWipe.join(", "));
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} CASCADE;`);

  const userCount = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM "User"`
  );
  console.log("Done. User table row count (unchanged):", userCount[0].count.toString());

  for (const table of tablesToWipe) {
    const res = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM "${table}"`
    );
    console.log(`  ${table}: ${res[0].count.toString()}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
