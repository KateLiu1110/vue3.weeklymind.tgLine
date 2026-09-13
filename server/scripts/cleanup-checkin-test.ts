import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // IMPORTANT: scope by creation time, not displayName — every "try as new user"
  // account (including 28 legitimate pre-existing ones restored earlier this
  // session) shares displayName '新朋友'. Filtering on that name again would
  // repeat the exact over-broad-delete mistake from earlier. Only remove accounts
  // created in the last 15 minutes (i.e. by this test run, nothing older).
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { displayName: "新朋友", createdAt: { gt: cutoff } },
    select: { id: true, createdAt: true },
  });
  console.log("found", users.length, "test accounts to remove:", JSON.stringify(users));
  for (const { id } of users) {
    await prisma.customModuleDailyTask.deleteMany({ where: { module: { userId: id } } });
    await prisma.customModuleScore.deleteMany({ where: { module: { userId: id } } });
    await prisma.customModuleExamDate.deleteMany({ where: { module: { userId: id } } });
    await prisma.customBoardItem.deleteMany({ where: { column: { module: { userId: id } } } });
    await prisma.customBoardColumn.deleteMany({ where: { module: { userId: id } } });
    await prisma.customTabItem.deleteMany({ where: { category: { module: { userId: id } } } });
    await prisma.customTabCategory.deleteMany({ where: { module: { userId: id } } });
    await prisma.customModule.deleteMany({ where: { userId: id } });
    await prisma.plan.deleteMany({ where: { userId: id } });
    await prisma.milestone.deleteMany({ where: { userId: id } });
    await prisma.schedule.deleteMany({ where: { userId: id } });
    await prisma.focusTask.deleteMany({ where: { userId: id } });
    await prisma.toeicExamDate.deleteMany({ where: { userId: id } });
    await prisma.toeicTaskItem.deleteMany({ where: { userId: id } });
    await prisma.toeicProfile.deleteMany({ where: { userId: id } });
    await prisma.project.deleteMany({ where: { userId: id } });
    await prisma.savedLink.deleteMany({ where: { userId: id } });
    await prisma.retroGoal.deleteMany({ where: { userId: id } });
    await prisma.achievement.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
  }
  console.log("cleaned", users.length, "accounts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
