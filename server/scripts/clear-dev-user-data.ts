import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Undo seed.ts's demo content for the real dev LINE account only — this
// account should start empty like any other real user, not carry sample data.
const DEV_LINE_USER_ID = "Uf7dd293205c24fd46a00cc153e1e3c27";

async function main() {
  const user = await prisma.user.findUnique({ where: { lineUserId: DEV_LINE_USER_ID } });
  if (!user) {
    console.log("Dev user not found, nothing to do.");
    return;
  }
  const userId = user.id;

  await prisma.plan.deleteMany({ where: { userId } });
  await prisma.milestone.deleteMany({ where: { userId } });
  await prisma.schedule.deleteMany({ where: { userId } });
  await prisma.focusTask.deleteMany({ where: { userId } });
  await prisma.toeicExamDate.deleteMany({ where: { userId } });
  await prisma.toeicTaskItem.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.savedLink.deleteMany({ where: { userId } });
  await prisma.retroGoal.deleteMany({ where: { userId } });
  await prisma.toeicProfile.deleteMany({ where: { userId } });
  await prisma.achievement.deleteMany({ where: { userId } });
  await prisma.user.update({ where: { id: userId }, data: { goalTitle: "" } });

  console.log("Cleared demo content for dev user:", userId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
