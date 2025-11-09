/**
 * 💰 updateJackpot
 * ---------------------------------------
 * Calculates and updates the next jackpot
 * amount based on whether the jackpot division was won.
 */
import { PrismaClient } from "@prisma/client";
import type { SchedulerGame, SchedulerDraw } from "../types";

export async function updateJackpot(
  prisma: PrismaClient,
  game: SchedulerGame,
  draw: SchedulerDraw,
  divisionResults: {
    type: string;
    poolCents: number;
    winnersCount: number;
    eachCents: number;
  }[]
): Promise<void> {
  const jackpotDivision = divisionResults.find((d) => d.type === "Jackpot");
  const jackpotWinners = jackpotDivision?.winnersCount ?? 0;

  const prevJackpot = draw.jackpotCents ?? game.baseJackpotCents ?? 0;
  const sales = draw.totalSalesCents ?? 0;

  // 🎯 Calculate next jackpot
  const nextJackpot =
    jackpotWinners > 0
      ? game.baseJackpotCents ?? 0 // reset if won
      : prevJackpot + (sales > 0 ? sales : 1000); // otherwise grow

  // 💾 Update game and next draw
  await prisma.game.update({
    where: { id: game.id },
    data: { currentJackpotCents: nextJackpot },
  });

  const nextDraw = await prisma.draw.findFirst({
    where: { gameId: game.id, status: "UPCOMING" },
    orderBy: { drawDate: "asc" },
  });

  if (nextDraw) {
    await prisma.draw.update({
      where: { id: nextDraw.id },
      data: { jackpotCents: nextJackpot },
    });
  }

  console.log(
    `💰 Jackpot for ${game.name} updated → $${(
      nextJackpot / 100
    ).toLocaleString()}`
  );
}
