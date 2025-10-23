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
    },
  });

  // 🗓️ Generate draws
  const games = [powerball, ozLotto, setForLife, saturdayLotto];

  for (const game of games) {
    await prisma.draw.deleteMany({ where: { gameId: game.id } });

    const draws = Array.from({ length: 6 }).map((_, i) => ({
      gameId: game.id,
      drawNumber: i + 1,
      drawDate: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000),
      jackpotAmountCents: 8_000_000_00 + i * 500_000_00,
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
