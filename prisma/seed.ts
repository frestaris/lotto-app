import { getNextDrawDates } from "../src/utils/getNextDrawDates.ts";
import { PrismaClient, DrawStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 🌟 StarPick
  const starPick = await prisma.game.upsert({
    where: { slug: "starpick" },
    update: {},
    create: {
      slug: "starpick",
      name: "StarPick",
      description:
        "Pick 5 numbers (1–69) and 1 Star Ball (1–10). Draw every Thursday at 8 PM.",
      iconName: "Star",
      priceCents: 300,
      mainPickCount: 5,
      mainRangeMin: 1,
      mainRangeMax: 69,
      specialPickCount: 1,
      specialRangeMin: 1,
      specialRangeMax: 10,
      drawFrequency: "Thursday 8 PM",
      baseJackpotCents: 1000000000,
      jackpotGrowthPct: 0.6,
      prizeDivisions: [
        { type: "Jackpot", matchMain: 5, matchSpecial: 1, percentage: 1.0 },
        { type: "Division 2", matchMain: 5, matchSpecial: 0, fixed: 10000000 },
        { type: "Division 3", matchMain: 4, matchSpecial: 1, fixed: 500000 },
        { type: "Division 4", matchMain: 4, matchSpecial: 0, fixed: 50000 },
        { type: "Division 5", matchMain: 3, matchSpecial: 1, fixed: 5000 },
        { type: "Division 6", matchMain: 3, matchSpecial: 0, fixed: 500 },
      ],
    },
  });

  // 🍀 LuckyDraw 7
  const luckyDraw7 = await prisma.game.upsert({
    where: { slug: "luckydraw-7" },
    update: {},
    create: {
      slug: "luckydraw-7",
      name: "LuckyDraw 7",
      description: "Pick 7 numbers (1–45). Draw every Tuesday at 8 PM.",
      iconName: "Gift",
      priceCents: 200,
      mainPickCount: 7,
      mainRangeMin: 1,
      mainRangeMax: 45,
      specialPickCount: 0,
      drawFrequency: "Tuesday 8 PM",
      baseJackpotCents: 500000000,
      jackpotGrowthPct: 0.5,
      prizeDivisions: [
        { type: "Jackpot", matchMain: 7, percentage: 1.0 },
        { type: "Division 2", matchMain: 6, fixed: 5000000 },
        { type: "Division 3", matchMain: 5, fixed: 500000 },
        { type: "Division 4", matchMain: 4, fixed: 50000 },
      ],
    },
  });

  // 🌙 DreamLine Daily
  const dreamLineDaily = await prisma.game.upsert({
    where: { slug: "dreamline-daily" },
    update: {},
    create: {
      slug: "dreamline-daily",
      name: "DreamLine Daily",
      description: "Pick 7 numbers (1–44). Daily draws at 9 PM.",
      iconName: "Moon",
      priceCents: 250,
      mainPickCount: 7,
      mainRangeMin: 1,
      mainRangeMax: 44,
      specialPickCount: 0,
      drawFrequency: "Daily 9 PM",
      baseJackpotCents: 200000000,
      jackpotGrowthPct: 0.4,
      prizeDivisions: [
        { type: "Jackpot", matchMain: 7, percentage: 1.0 },
        { type: "Division 2", matchMain: 6, fixed: 200000 },
        { type: "Division 3", matchMain: 5, fixed: 10000 },
        { type: "Division 4", matchMain: 4, fixed: 1000 },
      ],
    },
  });

  // 💎 Weekend Millions
  const weekendMillions = await prisma.game.upsert({
    where: { slug: "weekend-millions" },
    update: {},
    create: {
      slug: "weekend-millions",
      name: "Weekend Millions",
      description:
        "Pick 6 numbers (1–45). Draw every Saturday at 8 PM. Your classic weekend lotto for big wins!",
      iconName: "Trophy",
      priceCents: 250,
      mainPickCount: 6,
      mainRangeMin: 1,
      mainRangeMax: 45,
      specialPickCount: 0,
      drawFrequency: "Saturday 8 PM",
      baseJackpotCents: 300000000,
      jackpotGrowthPct: 0.5,
      prizeDivisions: [
        { type: "Jackpot", matchMain: 6, percentage: 1.0 },
        { type: "Division 2", matchMain: 5, fixed: 100000 },
        { type: "Division 3", matchMain: 4, fixed: 10000 },
        { type: "Division 4", matchMain: 3, fixed: 1000 },
      ],
    },
  });

  // 🗓️ GENERATE NEXT DRAWS
  const games = [starPick, luckyDraw7, dreamLineDaily, weekendMillions];

  for (const game of games) {
    await prisma.draw.deleteMany({ where: { gameId: game.id } });

    const drawDates = getNextDrawDates(game.drawFrequency ?? "Daily 9 PM", 6);

    const draws = drawDates.map((date, i) => ({
      gameId: game.id,
      drawNumber: i + 1,
      drawDate: date,
      jackpotCents: game.baseJackpotCents,
      totalSalesCents: 0,
      status: DrawStatus.UPCOMING,
      winningMainNumbers: [],
      winningSpecialNumbers: [],
    }));

    await prisma.draw.createMany({ data: draws });
    console.log(`🗓️ Created ${draws.length} draws for ${game.name}`);
  }

  console.log("✅ Seed completed successfully.");
}

main()
  .catch((e) => console.error("❌ Seed failed:", e))
  .finally(() => prisma.$disconnect());
