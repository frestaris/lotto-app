import cron from "node-cron";
import { PrismaClient, type Game, TicketStatus } from "@prisma/client";
import dotenv from "dotenv";
import { generateNumbers } from "@/utils/generateNumbers";
import { getCronExpression } from "@/utils/getCronExpression";

dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

async function createDrawForGame(game: Game) {
  const now = new Date();

  const lastDraw = await prisma.draw.findFirst({
    where: { gameId: game.id },
    orderBy: { drawNumber: "desc" },
  });

  const nextDrawNumber = (lastDraw?.drawNumber ?? 0) + 1;

  const winningMainNumbers = generateNumbers(
    game.mainPickCount,
    game.mainRangeMin,
    game.mainRangeMax
  );

  const winningSpecialNumbers =
    game.specialPickCount > 0
      ? generateNumbers(
          game.specialPickCount,
          game.specialRangeMin ?? 1,
          game.specialRangeMax ?? 10
        )
      : [];

  const draw = await prisma.draw.create({
    data: {
      gameId: game.id,
      drawNumber: nextDrawNumber,
      drawDate: now,
      winningMainNumbers,
      winningSpecialNumbers,
    },
  });

  console.log(`✅ Created Draw #${draw.drawNumber} for ${game.name}`);

  const tickets = await prisma.ticket.findMany({
    where: {
      gameId: game.id,
      status: TicketStatus.PENDING,
    },
  });

  for (const ticket of tickets) {
    const mainMatches = ticket.numbers.filter((n) =>
      winningMainNumbers.includes(n)
    ).length;

    const specialMatches = ticket.specialNumbers.filter((n) =>
      winningSpecialNumbers.includes(n)
    ).length;

    const won =
      mainMatches === game.mainPickCount &&
      specialMatches === game.specialPickCount;

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: won ? TicketStatus.WON : TicketStatus.LOST,
        drawId: draw.id,
        payoutCents: won ? game.priceCents * 100 : 0,
      },
    });

    console.log(
      `🎟️ Ticket ${ticket.id} → ${
        won ? "🏆 WON!" : "❌ LOST"
      } | main: ${mainMatches}/${
        game.mainPickCount
      }, special: ${specialMatches}/${game.specialPickCount}`
    );
  }
}

async function scheduleAllGames() {
  const games = await prisma.game.findMany();
  console.log(`🎯 Loaded ${games.length} games for scheduling.`);

  for (const game of games) {
    const cronExpr = getCronExpression(game.drawFrequency ?? "daily 9 PM");
    cron.schedule(cronExpr, async () => {
      await createDrawForGame(game);
    });
    console.log(
      `⏰ Scheduled ${game.name} (${
        game.drawFrequency ?? "daily 9 PM"
      }) → ${cronExpr}`
    );
  }
}

scheduleAllGames()
  .then(() => console.log("🚀 Draw scheduler running..."))
  .catch((err) => console.error("❌ Scheduler init failed:", err));
