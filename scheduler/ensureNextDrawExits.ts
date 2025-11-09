/**
 * 🗓️ Ensures there are always N upcoming draws for each game
 * - Preserves original behavior:
 *   1) Reads all UPCOMING draws
 *   2) Looks up the latest draw in DB
 *   3) Seeds latestDate/Number from latest draw if present, else from lastDraw arg
 */
import type { PrismaClient } from "@prisma/client";
import { getNextDrawDate } from "./getNextDrawDate";
import type { SchedulerGame, SchedulerDraw } from "./types";

export async function ensureNextDrawExists(
  prisma: PrismaClient,
  game: SchedulerGame,
  lastDraw: { drawDate: Date; drawNumber: number },
  count: number = 6
): Promise<void> {
  // 🔹 Get all upcoming draws for this game
  const upcoming: SchedulerDraw[] = await prisma.draw.findMany({
    where: { gameId: game.id, status: "UPCOMING" },
    orderBy: { drawNumber: "asc" },
  });

  // 🔹 Find the latest draw number in DB
  const latestDraw = await prisma.draw.findFirst({
    where: { gameId: game.id },
    orderBy: { drawNumber: "desc" },
  });

  // ✅ Preserve your original fallback semantics
  let latestDate = latestDraw?.drawDate ?? lastDraw.drawDate;
  let latestNumber = latestDraw?.drawNumber ?? lastDraw.drawNumber;

  // 🔹 Keep track of drawNumbers to avoid duplicates
  const existingNumbers = new Set(upcoming.map((d) => d.drawNumber));

  // safety cap to avoid accidental infinite loops if data is weird
  const hardCap = count + 20;
  let iterations = 0;

  // 🔹 While we have fewer than the desired upcoming draws, create new ones
  while (upcoming.length < count) {
    if (++iterations > hardCap) {
      console.warn(
        `⚠️ ensureNextDrawExists: aborting after ${iterations} iterations (game=${game.name})`
      );
      break;
    }

    latestNumber++;

    // 🛑 Skip if this number already exists (avoid duplicates)
    if (existingNumbers.has(latestNumber)) continue;

    const nextDate = getNextDrawDate(
      game.drawFrequency ?? "Saturday 8 PM",
      latestDate
    );

    const newDraw = await prisma.draw.create({
      data: {
        gameId: game.id,
        drawNumber: latestNumber,
        drawDate: nextDate,
        winningMainNumbers: [],
        winningSpecialNumbers: [],
        status: "UPCOMING",
        jackpotCents: game.currentJackpotCents ?? game.baseJackpotCents ?? 0,
      },
    });

    console.log(
      `📅 Created next draw #${latestNumber} for ${
        game.name
      } → ${nextDate.toISOString()}`
    );

    upcoming.push(newDraw);
    latestDate = nextDate;
    existingNumbers.add(latestNumber);
  }
}
