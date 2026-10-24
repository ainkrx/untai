import "dotenv/config";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { generateRandomString, hashPassword } from "better-auth/crypto";
import { account, user } from "./schema/auth";
import { pattern, patternCounter, patternStep, recreate, report, stepProgress } from "./schema/app";

const db = drizzle(process.env.DIRECT_URL!);

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const images = (n: number) => Array<string>(n).fill("/window.svg");
const newId = () => generateRandomString(32, "a-z", "A-Z", "0-9");

const userId = {
  admin: newId(),
  ana: newId(),
  budi: newId(),
  dewi: newId(),
  eka: newId(),
};

const patternId = {
  bunny_mostReviewed: randomUUID(),
  strawberry_topRated: randomUUID(),
  blanket_atLimit: randomUUID(),
  coaster_threeSteps: randomUUID(),
  beanie_withReportedRecreate: randomUUID(),
  cardigan_noRecreates: randomUUID(),
  socks_draft: randomUUID(),
  headband_rejected: randomUUID(),
  heart_takenDown: randomUUID(),
  tulip_inReview: randomUUID(),
};

const recreateId = {
  budi_onMostReviewed: randomUUID(),
  dewi_onMostReviewed: randomUUID(),
  dewi_onTopRated: randomUUID(),
  budi_onAtLimit: randomUUID(),
  dewi_reportedRecreate: randomUUID(),
  budi_onTakenDown: randomUUID(),
};

const users: (typeof user.$inferInsert)[] = [
  {
    id: userId.admin,
    name: "Admin",
    email: "admin@gmail.com",
    role: "admin",
    emailVerified: true,
  },
  {
    id: userId.ana,
    name: "Ana",
    email: "ana@gmail.com",
    emailVerified: true,
    bio: "Amigurumi and tiny keychains.",
  },
  {
    id: userId.budi,
    name: "Budi",
    email: "budi@gmail.com",
    emailVerified: true,
    bio: "Hats and cardigans.",
  },
  {
    id: userId.dewi,
    name: "Dewi",
    email: "dewi@gmail.com",
    emailVerified: true,
  },
  {
    id: userId.eka,
    name: "Eka",
    email: "eka@gmail.com",
    emailVerified: false,
  },
];

type SeedPattern = typeof pattern.$inferInsert & { id: string; steps: number };

const patterns: SeedPattern[] = [
  {
    id: patternId.bunny_mostReviewed,
    authorId: userId.ana,
    title: "Bunny Keychain",
    description: "A small bunny to hang on your keys.",
    images: images(2),
    category: "Keychain",
    tags: ["bunny", "pink", "keychain"],
    difficulty: "Beginner",
    status: "public",
    createdAt: daysAgo(40),
    publishedAt: daysAgo(38),
    steps: 8,
  },
  {
    id: patternId.strawberry_topRated,
    authorId: userId.ana,
    title: "Strawberry Plush",
    description: "A round strawberry with a leafy top.",
    images: images(1),
    category: "Amigurumi",
    tags: ["strawberry", "pink", "fruit"],
    difficulty: "Easy",
    status: "public",
    createdAt: daysAgo(36),
    publishedAt: daysAgo(35),
    steps: 6,
  },
  {
    id: patternId.blanket_atLimit,
    authorId: userId.ana,
    title: "Granny Square Blanket",
    description: "Fifty rounds of granny squares joined as you go.",
    images: images(5),
    category: "Blankets",
    tags: ["tag #1", "tag #2", "tag #3", "tag #4", "tag #5", "tag #6", "tag #7", "tag #8", "tag #9", "tag #10", "tag #11", "tag #12", "tag #13", "tag #14", "tag #15", "tag #16", "tag #17", "tag #18", "tag #19", "tag #20", "tag #21", "tag #22", "tag #23", "tag #24", "tag #25"],
    difficulty: "Intermediate",
    status: "public",
    createdAt: daysAgo(34),
    publishedAt: daysAgo(30),
    steps: 50,
  },
  {
    id: patternId.coaster_threeSteps,
    authorId: userId.ana,
    title: "Flower Coaster",
    description: "A quick coaster from leftover yarn.",
    images: images(1),
    category: "Home decor",
    tags: ["flower", "coaster"],
    difficulty: "Beginner",
    status: "public",
    createdAt: daysAgo(28),
    publishedAt: daysAgo(27),
    steps: 3,
  },
  {
    id: patternId.beanie_withReportedRecreate,
    authorId: userId.budi,
    title: "Ribbed Beanie",
    description: "A stretchy beanie worked flat and seamed.",
    images: images(3),
    category: "Hats",
    tags: ["beanie", "winter"],
    difficulty: "Easy",
    status: "public",
    createdAt: daysAgo(26),
    publishedAt: daysAgo(25),
    steps: 5,
  },
  {
    id: patternId.cardigan_noRecreates,
    authorId: userId.budi,
    title: "Cable Cardigan",
    description: "A long cardigan with front post cables.",
    images: images(4),
    category: "Outerwear",
    tags: ["cardigan", "cable", "winter"],
    difficulty: "Advanced",
    status: "public",
    createdAt: daysAgo(24),
    publishedAt: daysAgo(22),
    steps: 12,
  },
  {
    id: patternId.socks_draft,
    authorId: userId.ana,
    title: "Cozy Socks",
    description: "Ankle socks with a folded cuff.",
    images: images(1),
    category: "Socks",
    tags: ["socks", "winter"],
    difficulty: "Intermediate",
    status: "private",
    createdAt: daysAgo(5),
    steps: 4,
  },
  {
    id: patternId.headband_rejected,
    authorId: userId.ana,
    title: "Cat Ears Headband",
    description: "A headband with two small ears.",
    images: images(1),
    category: "Hats",
    tags: ["cat", "headband"],
    difficulty: "Easy",
    status: "private",
    adminReason: "Step 3 is missing the stitch count.",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(8),
    steps: 5,
  },
  {
    id: patternId.heart_takenDown,
    authorId: userId.ana,
    title: "Heart Bag Charm",
    description: "A puffy heart for your bag.",
    images: images(2),
    category: "Keychain",
    tags: ["heart", "pink", "keychain"],
    difficulty: "Beginner",
    status: "private",
    adminReason: "The photos are from another site.",
    createdAt: daysAgo(33),
    publishedAt: daysAgo(32),
    steps: 4,
  },
  {
    id: patternId.tulip_inReview,
    authorId: userId.ana,
    title: "Tulip Bouquet",
    description: "Three tulips with wire stems.",
    images: images(3),
    category: "Home decor",
    tags: ["flower", "tulip"],
    difficulty: "Intermediate",
    status: "in_review",
    createdAt: daysAgo(4),
    steps: 7,
  },
];

const patternRows: (typeof pattern.$inferInsert)[] = [];
const steps: (typeof patternStep.$inferInsert & { id: string })[] = [];
for (const { steps: count, ...p } of patterns) {
  patternRows.push({ ...p, updatedAt: p.updatedAt ?? p.createdAt });
  for (let i = 0; i < count; i++) {
    steps.push({
      id: randomUUID(),
      patternId: p.id,
      position: i + 1,
      description: `Round ${i + 1}: work the stitches as shown in the photo.`,
      images: images(i % 4),
    });
  }
}

const recreates: (typeof recreate.$inferInsert)[] = [
  {
    id: recreateId.budi_onMostReviewed,
    patternId: patternId.bunny_mostReviewed,
    authorId: userId.budi,
    rating: 4,
    images: images(1),
  },
  {
    id: recreateId.dewi_onMostReviewed,
    patternId: patternId.bunny_mostReviewed,
    authorId: userId.dewi,
    rating: 5,
    images: images(3),
  },
  {
    id: recreateId.dewi_onTopRated,
    patternId: patternId.strawberry_topRated,
    authorId: userId.dewi,
    rating: 5,
    images: images(1),
  },
  {
    id: recreateId.budi_onAtLimit,
    patternId: patternId.blanket_atLimit,
    authorId: userId.budi,
    rating: 4,
    images: images(2),
  },
  {
    id: recreateId.dewi_reportedRecreate,
    patternId: patternId.beanie_withReportedRecreate,
    authorId: userId.dewi,
    rating: 2,
    images: images(2),
  },
  {
    id: recreateId.budi_onTakenDown,
    patternId: patternId.heart_takenDown,
    authorId: userId.budi,
    rating: 4,
    images: images(1),
  },
].map((r, i) => ({ ...r, caption: `My try at this one, ${r.rating} out of 5.`, createdAt: daysAgo(20 - i) }));

const reports: (typeof report.$inferInsert)[] = [
  {
    targetType: "pattern",
    targetId: patternId.bunny_mostReviewed,
    reporterId: userId.budi,
    reason: "Spam",
  },
  {
    targetType: "pattern",
    targetId: patternId.bunny_mostReviewed,
    reporterId: userId.dewi,
    reason: "Other",
    note: "Looks copied from a paid pattern.",
  },
  {
    targetType: "recreate",
    targetId: recreateId.dewi_reportedRecreate,
    reporterId: userId.ana,
    reason: "Inappropriate content",
    note: "The photo is not crochet.",
  },
];

const checkedSteps: (typeof stepProgress.$inferInsert)[] = steps
  .filter((s) => s.patternId === patternId.bunny_mostReviewed && s.position <= 3)
  .map((s) => ({ userId: userId.dewi, patternId: s.patternId, stepId: s.id }));

const counters: (typeof patternCounter.$inferInsert)[] = [
  {
    userId: userId.dewi,
    patternId: patternId.bunny_mostReviewed,
    rowCount: 12,
    stitchCount: 36,
  },
  {
    userId: userId.ana,
    patternId: patternId.socks_draft,
    rowCount: 5,
    stitchCount: 20,
  },
];

// wipes the whole database
if (new URL(process.env.DIRECT_URL!).hostname !== "localhost") {
  throw new Error("The seeder only runs against the local database.");
}
await db.execute(sql`drop schema if exists public cascade`);
await db.execute(sql`drop schema if exists drizzle cascade`);
await db.execute(sql`create schema public`);
await migrate(db, { migrationsFolder: "drizzle" });

const hash = await hashPassword("password123");

await db.transaction(async (tx) => {
  await tx.insert(user).values(users);
  await tx.insert(account).values(
    users.map((u) => ({
      id: newId(),
      accountId: u.id!,
      providerId: "credential",
      userId: u.id!,
      password: hash,
    })),
  );
  await tx.insert(pattern).values(patternRows);
  await tx.insert(patternStep).values(steps);
  await tx.insert(recreate).values(recreates);
  await tx.insert(report).values(reports);
  await tx.insert(stepProgress).values(checkedSteps);
  await tx.insert(patternCounter).values(counters);
});

console.log("Seeded.");
process.exit(0);