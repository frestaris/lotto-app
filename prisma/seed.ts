import { getNextDrawDates } from "../src/utils/getNextDrawDates.ts";
import { PrismaClient, DrawStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 🎯 Powerball
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

      // Jackpot + divisions
      baseJackpotCents: 1000000000, // $10,000,000
      jackpotGrowthPct: 0.6,
      prizeDivisions: [
        { matchMain: 5, matchSpecial: 1, type: "Jackpot", percentage: 0.7 },
        { matchMain: 5, matchSpecial: 0, type: "Division 2", percentage: 0.1 },
        { matchMain: 4, matchSpecial: 1, type: "Division 3", percentage: 0.08 },
        { matchMain: 4, matchSpecial: 0, type: "Division 4", percentage: 0.06 },
        { matchMain: 3, matchSpecial: 1, type: "Division 5", percentage: 0.04 },
        { matchMain: 3, matchSpecial: 0, type: "Division 6", fixed: 5000 },
      ],
    },
  });

  // 💫 Oz Lotto
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
        { matchMain: 7, type: "Jackpot", percentage: 0.7 },
        { matchMain: 6, type: "Division 2", percentage: 0.15 },
        { matchMain: 5, type: "Division 3", percentage: 0.1 },
        { matchMain: 4, type: "Division 4", percentage: 0.05 },
      ],
    },
  });

  // 💰 Set for Life
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
        { matchMain: 7, type: "Top Prize", percentage: 0.5 },
        { matchMain: 6, type: "Division 2", percentage: 0.2 },
        { matchMain: 5, type: "Division 3", fixed: 10000 },
        { matchMain: 4, type: "Division 4", fixed: 1000 },
      ],
    },
  });

  // 🎟️ Saturday Lotto
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
        { matchMain: 6, type: "Jackpot", percentage: 0.7 },
        { matchMain: 5, type: "Division 2", percentage: 0.15 },
        { matchMain: 4, type: "Division 3", percentage: 0.1 },
        { matchMain: 3, type: "Division 4", fixed: 1000 },
      ],
    },
  });

  // 🗓️ Generate draws dynamically based on frequency
  const games = [powerball, ozLotto, setForLife, saturdayLotto];

  for (const game of games) {
    await prisma.draw.deleteMany({ where: { gameId: game.id } });

    const drawDates = getNextDrawDates(game.drawFrequency ?? "Daily 9 PM", 6);

    const draws = drawDates.map((date, i) => ({
      gameId: game.id,
      drawNumber: i + 1,
      drawDate: date,
      jackpotAmountCents: game.baseJackpotCents + i * 500_000_00,
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
