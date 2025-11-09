/**
 * ---------------------------------------
 * Runs all due draws for a given game (where drawDate ≤ now and status = UPCOMING)
 * Generates winning numbers, determines winners, updates tickets, credits users,
 * calculates next jackpot, and ensures the next draw exists.
 */
import { PrismaClient, TicketStatus } from "@prisma/client";
import type { SchedulerGame } from "./types";
import { generateNumbers } from "../src/utils/generateNumbers";
import { sendWinEmail } from "../src/utils/sendWinEmail";
import { ensureNextDrawExists } from "./ensureNextDrawExits";

export async function runDueDrawsForGame(
  prisma: PrismaClient,
  game: SchedulerGame
) {
  const now = new Date();

  // Fetch any draws that are due and still marked UPCOMING
  const dueDraws = await prisma.draw.findMany({
    where: { gameId: game.id, drawDate: { lte: now }, status: "UPCOMING" },
    orderBy: { drawNumber: "asc" },
  });

  for (const draw of dueDraws) {
    console.log(`✅ Running Draw #${draw.drawNumber} for ${game.name}`);

    // ---------------------------------------
    // 🎲 1. Generate Winning Numbers
    // ---------------------------------------
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

    // ---------------------------------------
    // 🎟️ 2. Fetch All Tickets for This Draw
    // ---------------------------------------
    const tickets = await prisma.ticket.findMany({
      where: { drawId: draw.id, status: TicketStatus.PENDING },
    });

    // ---------------------------------------
    // 🏆 3. Parse Prize Divisions
    // ---------------------------------------
    let divisions: {
      matchMain: number;
      matchSpecial?: number;
      percentage?: number;
      fixed?: number;
      type: string;
    }[] = [];

    try {
      divisions =
        typeof game.prizeDivisions === "string"
          ? JSON.parse(game.prizeDivisions)
          : game.prizeDivisions ?? [];
    } catch (err) {
      console.warn("⚠️ Failed to parse prizeDivisions for", game.name, err);
      divisions = [];
    }

    // ---------------------------------------
    // 🎯 4. Determine Winning Tickets Per Division
    // ---------------------------------------
    const divisionWinnersMap: Record<string, string[]> = {};

    for (const t of tickets) {
      const mainMatches = t.numbers.filter((n) =>
        winningMainNumbers.includes(n)
      ).length;

      const specialMatches = t.specialNumbers.filter((n) =>
        winningSpecialNumbers.includes(n)
      ).length;

      const matched = divisions.find(
        (d) =>
          mainMatches === d.matchMain &&
          (d.matchSpecial == null || specialMatches === d.matchSpecial)
      );

      if (matched) {
        if (!divisionWinnersMap[matched.type])
          divisionWinnersMap[matched.type] = [];
        divisionWinnersMap[matched.type].push(t.id);
      }
    }

    // ---------------------------------------
    // 💰 5. Calculate & Distribute Prizes
    // ---------------------------------------
    const divisionResults: {
      type: string;
      poolCents: number;
      winnersCount: number;
      eachCents: number;
    }[] = [];

    for (const rule of divisions) {
      const winners = divisionWinnersMap[rule.type] ?? [];
      if (winners.length === 0) continue;

      const safeJackpot = draw.jackpotCents ?? game.baseJackpotCents ?? 0;
      const poolCents = rule.fixed
        ? rule.fixed
        : Math.floor(safeJackpot * (rule.percentage ?? 0));

      const payoutPerWinner = Math.floor(poolCents / winners.length);

      for (const ticketId of winners) {
        const t = tickets.find((tk) => tk.id === ticketId)!;

        // 🟢 Update ticket as WINNER
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.WON, payoutCents: payoutPerWinner },
        });

        console.log(
          `🎯 Updated ticket ${ticketId} → payout: $${(
            payoutPerWinner / 100
          ).toLocaleString()}`
        );

        // 🟢 Credit user's wallet
        await prisma.user.update({
          where: { id: t.userId },
          data: { creditCents: { increment: payoutPerWinner } },
        });

        // 🧾 Create wallet transaction
        await prisma.walletTransaction.create({
          data: {
            userId: t.userId,
            type: "PAYOUT",
            amountCents: payoutPerWinner,
            reference: draw.id,
            gameId: game.id,
            drawId: draw.id,
            description: `Prize payout (${rule.type}) for draw #${draw.drawNumber} (${game.name})`,
          },
        });

        // ✉️ Notify user by email
        const user = await prisma.user.findUnique({
          where: { id: t.userId },
          select: { email: true },
        });

        if (user?.email) {
          sendWinEmail(user.email, game.name, payoutPerWinner).catch(
            (err: unknown) => {
              console.error("❌ Failed to send win email:", err);
            }
          );
        }
      }

      // 🧾 Record division result
      divisionResults.push({
        type: rule.type,
        poolCents,
        winnersCount: winners.length,
        eachCents: payoutPerWinner,
      });

      console.log(
        `🏆 ${rule.type}: ${winners.length} winner(s) → each gets $${(
          payoutPerWinner / 100
        ).toLocaleString()}`
      );
    }

    // ---------------------------------------
    // ❌ 6. Mark Remaining Tickets as LOST
    // ---------------------------------------
    const allWinnerIds = Object.values(divisionWinnersMap).flat();

    await prisma.ticket.updateMany({
      where: {
        drawId: draw.id,
        id: allWinnerIds.length > 0 ? { notIn: allWinnerIds } : undefined,
      },
      data: { status: TicketStatus.LOST, payoutCents: 0 },
    });

    // ---------------------------------------
    // ✅ 7. Mark Draw Complete + Store Results
    // ---------------------------------------
    await prisma.draw.update({
      where: { id: draw.id },
      data: {
        status: "COMPLETED",
        winningMainNumbers,
        winningSpecialNumbers,
        divisionResults,
        jackpotCents:
          draw.jackpotCents ??
          game.currentJackpotCents ??
          game.baseJackpotCents ??
          0,
      },
    });

    console.log(`🎉 Completed draw ${draw.drawNumber} for ${game.name}`);

    // ---------------------------------------
    // 💵 8. Jackpot Rollover / Growth Logic
    // ---------------------------------------
    const winnerCount = await prisma.ticket.count({
      where: { drawId: draw.id, status: TicketStatus.WON },
    });

    const totalPayoutCents = divisionResults.reduce(
      (sum, d) => sum + d.eachCents * d.winnersCount,
      0
    );

    const prevJackpot = draw.jackpotCents ?? game.baseJackpotCents ?? 0;
    const jackpotDivision = divisionResults.find((d) => d.type === "Jackpot");
    const jackpotWinners = jackpotDivision?.winnersCount ?? 0;

    let nextJackpot = 0;
    if (jackpotWinners > 0) {
      // Jackpot was hit → reset to base amount
      nextJackpot = game.baseJackpotCents ?? 0;
    } else {
      // No jackpot winners → carry over
      const sales = draw.totalSalesCents ?? 0;
      nextJackpot = sales === 0 ? prevJackpot + 1000 : prevJackpot + sales;
    }

    console.log(
      `💰 Next jackpot for ${game.name}: $${(
        nextJackpot / 100
      ).toLocaleString()} (previous: $${(
        prevJackpot / 100
      ).toLocaleString()}, sales: ${draw.totalSalesCents ?? 0})`
    );

    // ---------------------------------------
    // 🧾 9. Update Database Records
    // ---------------------------------------
    await prisma.draw.update({
      where: { id: draw.id },
      data: {
        winnersCount: winnerCount,
        totalPayoutCents,
      },
    });

    await ensureNextDrawExists(prisma, game, draw, 6);

    const nextDraw = await prisma.draw.findFirst({
      where: { gameId: game.id, status: "UPCOMING" },
      orderBy: { drawDate: "asc" },
    });

    if (nextDraw) {
      await prisma.draw.update({
        where: { id: nextDraw.id },
        data: { jackpotCents: nextJackpot },
      });

      await prisma.game.update({
        where: { id: game.id },
        data: { currentJackpotCents: nextJackpot },
      });

      console.log(
        `💰 Jackpot for next draw (${game.name}) set to $${(
          nextJackpot / 100
        ).toLocaleString()}`
      );
    }
  }
}
