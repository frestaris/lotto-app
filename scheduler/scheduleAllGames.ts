/**
 * ---------------------------------------
 * Loads all games from the database and schedules draws
 * according to their drawFrequency using node-cron.
 */
import cron from "node-cron";
import type { PrismaClient } from "@prisma/client";
import { getNextDrawDate } from "./getNextDrawDate";
import { runDueDrawsForGame } from "./runDueDrawsForGame";
import type { SchedulerGame } from "./types";
import { getCronExpression } from "../src/utils/getCronExpression";
import { ensureNextDrawExists } from "./ensureNextDrawExits";

export async function scheduleAllGames(prisma: PrismaClient) {
  const games = await prisma.game.findMany();
  console.log(`🎯 Loaded ${games.length} games for scheduling.`);

  for (const rawGame of games) {
    // Parse prizeDivisions JSON safely into typed array
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

    // Build a properly typed SchedulerGame
    const game: SchedulerGame = {
      ...rawGame,
      prizeDivisions: parsedDivisions,
    };

    const cronExpr = getCronExpression(game.drawFrequency ?? "Saturday 8 PM");

    // 🕒 Schedule periodic execution
    cron.schedule(
      cronExpr,
      async () => {
        await runDueDrawsForGame(prisma, game);
      },
      { timezone: "Australia/Brisbane" }
    );

    console.log(
      `⏰ Scheduled ${game.name} (${
        game.drawFrequency ?? "Saturday 8 PM"
      }) → ${cronExpr}`
    );

    // Run once immediately on startup
    await runDueDrawsForGame(prisma, game);

    // 🧾 Ensure an upcoming draw exists on startup
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

      console.log(
        `🆕 Created initial draw for ${
          game.name
        } → ${firstDrawDate.toISOString()}`
      );
    } else {
      await ensureNextDrawExists(prisma, game, latestDraw, 6);
    }
  }
}
