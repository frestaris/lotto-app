/**
 * 🧮 calculatePrizes
 * ---------------------------------------
 * Determines winners per prize division,
 * updates tickets and users, and returns division results.
 */
import { PrismaClient, TicketStatus } from "@prisma/client";
import type { SchedulerGame, SchedulerDraw } from "../types";
import { sendWinEmail } from "../../src/utils/sendWinEmail";

export async function calculatePrizes(
  prisma: PrismaClient,
  game: SchedulerGame,
  draw: SchedulerDraw,
  winningMainNumbers: number[],
  winningSpecialNumbers: number[]
): Promise<{
  divisionResults: {
    type: string;
    poolCents: number;
    winnersCount: number;
    eachCents: number;
  }[];
  winnersMap: Record<string, string[]>;
}> {
  // 🎟 Fetch all pending tickets for this draw
  const tickets = await prisma.ticket.findMany({
    where: { drawId: draw.id, status: TicketStatus.PENDING },
  });

  // 🏆 Parse prize divisions
  const divisions =
    game.prizeDivisions && Array.isArray(game.prizeDivisions)
      ? game.prizeDivisions
      : [];

  const winnersMap: Record<string, string[]> = {};
  const divisionResults: {
    type: string;
    poolCents: number;
    winnersCount: number;
    eachCents: number;
  }[] = [];

  // ---------------------------------------
  // 🎯 Match tickets to winning divisions
  // ---------------------------------------
  for (const ticket of tickets) {
    const mainMatches = ticket.numbers.filter((n) =>
      winningMainNumbers.includes(n)
    ).length;

    const specialMatches = ticket.specialNumbers.filter((n) =>
      winningSpecialNumbers.includes(n)
    ).length;

    const matched = divisions.find(
      (d) =>
        mainMatches === d.matchMain &&
        (d.matchSpecial == null || specialMatches === d.matchSpecial)
    );

    if (matched) {
      if (!winnersMap[matched.type]) winnersMap[matched.type] = [];
      winnersMap[matched.type].push(ticket.id);
    }
  }

  // ---------------------------------------
  // 💰 Calculate and distribute payouts
  // ---------------------------------------
  for (const rule of divisions) {
    const winnerIds = winnersMap[rule.type] ?? [];
    if (winnerIds.length === 0) continue;

    const safeJackpot = draw.jackpotCents ?? game.baseJackpotCents ?? 0;
    const poolCents = rule.fixed
      ? rule.fixed
      : Math.floor(safeJackpot * (rule.percentage ?? 0));
    const payoutPerWinner = Math.floor(poolCents / winnerIds.length);

    for (const ticketId of winnerIds) {
      const ticket = tickets.find((t) => t.id === ticketId)!;

      // 🟢 Mark ticket as winner
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.WON, payoutCents: payoutPerWinner },
      });

      // 💵 Add credits to user
      await prisma.user.update({
        where: { id: ticket.userId },
        data: { creditCents: { increment: payoutPerWinner } },
      });

      // 🧾 Create wallet transaction
      await prisma.walletTransaction.create({
        data: {
          userId: ticket.userId,
          gameId: game.id,
          drawId: draw.id,
          type: "PAYOUT",
          amountCents: payoutPerWinner,
          description: `Prize ${rule.type} for draw #${draw.drawNumber}`,
        },
      });

      // ✉️ Notify winner via email
      const user = await prisma.user.findUnique({
        where: { id: ticket.userId },
        select: { email: true },
      });

      if (user?.email) {
        sendWinEmail(user.email, game.name, payoutPerWinner).catch(
          (err: unknown) => console.error("❌ Failed to send win email:", err)
        );
      }
    }

    divisionResults.push({
      type: rule.type,
      poolCents,
      winnersCount: winnerIds.length,
      eachCents: payoutPerWinner,
    });
  }

  return { divisionResults, winnersMap };
}
