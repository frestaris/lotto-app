import { getNextDrawDates } from "../src/utils/getNextDrawDates.ts";
import { PrismaClient, DrawStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 🎯 POWERBALL
  const powerball = await prisma.game.upsert({
    where: { slug: "powerball" },
    update: {},
    create: {
      slug: "powerball",
      name: "Powerball",
      description:
        "Pick 5 numbers (1–69) and 1 Powerball (1–10). Draw every Thursday at 8 PM.",
      logoUrl: "/images/powerball.png",
      priceCents: 300,
      mainPickCount: 5,
      mainRangeMin: 1,
      mainRangeMax: 69,
      specialPickCount: 1,
      specialRangeMin: 1,
      specialRangeMax: 10,
      drawFrequency: "Thursday 8 PM",
      baseJackpotCents: 1000000000, // $10,000,000
      jackpotGrowthPct: 0.6,

      // ✅ Jackpot is full payout (1.0)
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

  // 💫 OZ LOTTO
  const ozLotto = await prisma.game.upsert({
    where: { slug: "oz-lotto" },
    update: {},
    create: {
      slug: "oz-lotto",
      name: "Oz Lotto",
      description: "Pick 7 numbers (1–45). Draw every Tuesday at 8 PM.",
      logoUrl: "/images/ozlotto.png",
      priceCents: 200,
      mainPickCount: 7,
      mainRangeMin: 1,
      mainRangeMax: 45,
      specialPickCount: 0,
      drawFrequency: "Tuesday 8 PM",
      baseJackpotCents: 500000000, // $5,000,000
      jackpotGrowthPct: 0.5,

      prizeDivisions: [
        { type: "Jackpot", matchMain: 7, percentage: 1.0 },
        { type: "Division 2", matchMain: 6, fixed: 5000000 },
        { type: "Division 3", matchMain: 5, fixed: 500000 },
        { type: "Division 4", matchMain: 4, fixed: 50000 },
      ],
    },
  });

  // 💰 SET FOR LIFE
  const setForLife = await prisma.game.upsert({
    where: { slug: "set-for-life" },
    update: {},
    create: {
      slug: "set-for-life",
      name: "Set for Life",
      description: "Pick 7 numbers (1–44). Daily draws at 9 PM.",
      logoUrl: "/images/setforlife.png",
      priceCents: 250,
      mainPickCount: 7,
      mainRangeMin: 1,
      mainRangeMax: 44,
      specialPickCount: 0,
      drawFrequency: "Daily 9 PM",
      baseJackpotCents: 200000000, // $2,000,000
      jackpotGrowthPct: 0.4,

      prizeDivisions: [
        { type: "Top Prize", matchMain: 7, percentage: 1.0 },
        { type: "Division 2", matchMain: 6, fixed: 200000 },
        { type: "Division 3", matchMain: 5, fixed: 10000 },
        { type: "Division 4", matchMain: 4, fixed: 1000 },
      ],
    },
  });

  // 🎟️ SATURDAY LOTTO
  const saturdayLotto = await prisma.game.upsert({
    where: { slug: "saturday-lotto" },
    update: {},
    create: {
      slug: "saturday-lotto",
      name: "Saturday Lotto",
      description:
        "Pick 6 numbers (1–45). Draw every Saturday at 8 PM. Classic Australian lotto game with big jackpots!",
      logoUrl: "/images/saturdaylotto.png",
      priceCents: 250,
      mainPickCount: 6,
      mainRangeMin: 1,
      mainRangeMax: 45,
      specialPickCount: 0,
      drawFrequency: "Saturday 8 PM",
      baseJackpotCents: 300000000, // $3,000,000
      jackpotGrowthPct: 0.5,

      prizeDivisions: [
        { type: "Jackpot", matchMain: 6, percentage: 1.0 },
        { type: "Division 2", matchMain: 5, fixed: 100000 },
        { type: "Division 3", matchMain: 4, fixed: 10000 },
        { type: "Division 4", matchMain: 3, fixed: 1000 },
      ],
    },
  });

  // const testlotto = await prisma.game.upsert({
  //   where: { slug: "test-lotto" },
  //   update: {
  //     name: "Test Lotto",
  //     description:
  //       "A fast lotto game for debugging. Draw runs every 5 minutes.",
  //     logoUrl: "/images/test-lotto.png",
  //     priceCents: 200,
  //     mainPickCount: 3,
  //     mainRangeMin: 1,
  //     mainRangeMax: 60, // ✅ will now update existing record
  //     specialPickCount: 0,
  //     drawFrequency: "Every 5min",
  //     baseJackpotCents: 500000,
  //     jackpotGrowthPct: 0.5,
  //     prizeDivisions: JSON.stringify([
  //       { type: "Jackpot", matchMain: 6, percentage: 1.0 },
  //       { type: "Division 2", matchMain: 2, fixed: 1000 },
  //       { type: "Division 3", matchMain: 1, fixed: 200 },
  //     ]),
  //   },
  //   create: {
  //     slug: "test-lotto",
  //     name: "Test Lotto",
  //     description:
  //       "A fast lotto game for debugging. Draw runs every 5 minutes.",
  //     logoUrl: "/images/test-lotto.png",
  //     priceCents: 200,
  //     mainPickCount: 3,
  //     mainRangeMin: 1,
  //     mainRangeMax: 60,
  //     specialPickCount: 0,
  //     drawFrequency: "Every 5min",
  //     baseJackpotCents: 500000,
  //     jackpotGrowthPct: 0.5,
  //     prizeDivisions: JSON.stringify([
  //       { type: "Jackpot", matchMain: 3, percentage: 1.0 },
  //       { type: "Division 2", matchMain: 2, fixed: 1000 },
  //       { type: "Division 3", matchMain: 1, fixed: 200 },
  //     ]),
  //   },
  // });

  // 🗓️ GENERATE NEXT DRAWS
  const games = [powerball, ozLotto, setForLife, saturdayLotto];
  // const games = [testlotto];
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
