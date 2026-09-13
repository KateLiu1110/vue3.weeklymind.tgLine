import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

// Undo an over-broad cleanup that deleted every User row with displayName
// '新朋友' (the generic name the "try as new user" flow assigns), which wrongly
// caught 28 pre-existing guest accounts along with the tester's own throwaway ones.
// Restores just those 28 exact rows from the pre-session backup.
const idsToRestore = [
  "cmsvnnxx30001qm0pxglqbssw",
  "cmsvvwwch0002qm0prghmgnnk",
  "cmtposzqa001pvpwge6b2zjwq",
  "cmt4l66xa0000vpsccly70to2",
  "cmt4lyynw0000vpvkirzosyg5",
  "cmtpy1g7y0000vpbwmhashi75",
  "cmtpy3bmu0008vpbwe1u1jgvm",
  "cmtu7ryil0000vpds1gsxebrl",
  "cmtu7yrne0001vpdsmmrl7g9k",
  "cmtvo8ks2000fvpdsbvj5pv8a",
  "cmtvp7aoc000gvpdsrvbmrl6e",
  "cmtpiuz8n001tvpj8aeu0fv4g",
  "cmtpll46d003avpj8g9ex4eho",
  "cmtpm5dr7003tvpj82ubmr4xt",
  "cmtpmbbdw006rvpj8yk3f8rhq",
  "cmtpmexds0073vpj8e4j1076l",
  "cmtpmgnq4007mvpj8ee975y1x",
  "cmtpmj6nm0085vpj8cq8js1k3",
  "cmtpmmxez008ovpj8x5ube0ki",
  "cmtpo5jr90000vpqomjedjtwd",
  "cmtpo7g060001vpqo56y9fa57",
  "cmtpo87jc000cvpqol10hsv8n",
  "cmtpocxs50000vpk489p0e6d9",
  "cmtpojdov0000vp78iinclftb",
  "cmtpooqbv0000vpwg3md8cbro",
  "cmtpoq0iz000nvpwgjzuswjac",
  "cmtpor8zi0016vpwgwxy6rvfy",
  "cmtxn9zfo000ivp1k9n9kwsnu",
];

async function main() {
  const backup = JSON.parse(
    readFileSync("backups/backup-2026-09-12T14-58-46-320Z.json", "utf-8")
  );
  const usersById = new Map(backup.User.map((u: any) => [u.id, u]));

  let restored = 0;
  for (const id of idsToRestore) {
    const u: any = usersById.get(id);
    if (!u) {
      console.log("MISSING from backup, skipped:", id);
      continue;
    }
    await prisma.user.create({
      data: {
        id: u.id,
        phone: u.phone,
        lineUserId: u.lineUserId,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        botPlatform: u.botPlatform,
        botLang: u.botLang,
        theme: u.theme,
        goalTitle: u.goalTitle,
        createdAt: new Date(u.createdAt),
      },
    });
    restored++;
  }
  console.log("Restored", restored, "of", idsToRestore.length, "users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
