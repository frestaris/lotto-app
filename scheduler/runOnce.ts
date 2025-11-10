import { PrismaClient } from "@prisma/client";
import { SchedulerGame } from "./types";
import { runDueDrawsForGame } from "./runDueDrawsForGame";
import { getNextDrawDate } from "./getNextDrawDate";
import { ensureNextDrawExists } from "./ensureNextDrawExits";
const prisma = new PrismaClient();

async function runOnce() {
  console.log("🎯 Running one-time scheduler check...");
  const rawGames = await prisma.game.findMany();

  for (const rawGame of rawGames) {
    // ✅ Parse prizeDivisions safely
    let parsedDivisions: SchedulerGame["prizeDivisions"] = null;

    try {
      parsedDivisions =
        typeof rawGame.prizeDivisions === "string"
          ? (JSON.parse(
              rawGame.prizeDivisions
            ) as SchedulerGame["prizeDivisions"])
          : (rawGame.prizeDivisions as SchedulerGame["prizeDivisions"]) ?? null;
    } catch (err) {
      console.warn(
        `⚠️ Failed to parse prizeDivisions for ${rawGame.name}`,
        err
      );
      parsedDivisions = null;
    }

    // ✅ Now create a properly typed SchedulerGame
    const game: SchedulerGame = {
      ...rawGame,
      prizeDivisions: parsedDivisions,
    };

    await runDueDrawsForGame(prisma, game);

    const latestDraw = await prisma.draw.findFirst({
      where: { gameId: game.id },
      orderBy: { drawNumber: "desc" },
    });

    if (!latestDraw) {
      const firstDrawDate = getNextDrawDate(
        game.drawFrequency ?? "Saturday 8 PM",
        new Date()
      );
      await prisma.draw.create({
        data: {
          gameId: game.id,
          drawNumber: 1,
          drawDate: firstDrawDate,
          winningMainNumbers: [],
          winningSpecialNumbers: [],
          status: "UPCOMING",
          jackpotCents: game.currentJackpotCents ?? game.baseJackpotCents ?? 0,
        },
      });
      console.log(`🆕 Created initial draw for ${game.name}`);
    } else {
      await ensureNextDrawExists(prisma, game, latestDraw, 6);
    }
  }

  console.log("✅ Scheduler run complete.");
  await prisma.$disconnect();
  process.exit(0);
}

runOnce().catch((err) => {
  console.error("❌ Scheduler run failed:", err);
  process.exit(1);
});
