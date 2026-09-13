import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// Uses raw SQL (not the Prisma model client) so this backs up whatever
// columns/tables actually exist in the target database, even if it's
// behind the local schema.prisma (e.g. a migration not yet deployed).
const tables = [
  "User",
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
  "ExecCategory",
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
  const backup: Record<string, unknown[]> = {};
  const counts: Record<string, number | string> = {};

  for (const table of tables) {
    try {
      const rows = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT * FROM "${table}"`
      );
      backup[table] = rows;
      counts[table] = rows.length;
    } catch (e: any) {
      counts[table] = `SKIPPED (${e.message?.split("\n")[0] ?? e}）`;
    }
  }

  const dir = join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(dir, `backup-${timestamp}.json`);
  writeFileSync(
    file,
    JSON.stringify(backup, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2),
    "utf-8"
  );

  console.log("Backup written to:", file);
  console.log("Row counts:");
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table}: ${count}`);
  }
  const total = Object.values(counts)
    .filter((c): c is number => typeof c === "number")
    .reduce((a, b) => a + b, 0);
  console.log("Total rows backed up:", total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
