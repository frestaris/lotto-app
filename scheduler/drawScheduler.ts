import cron from "node-cron";
import { PrismaClient, TicketStatus } from "@prisma/client";

import dotenv from "dotenv";
import { generateNumbers } from "../src/utils/generateNumbers.ts";
import { getCronExpression } from "../src/utils/getCronExpression.ts";
import { sendWinEmail } from "../src/utils/sendWinEmail.ts";

import type { SchedulerGame, SchedulerDraw } from "./types";

dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

/**
 * 🔁 Run all draws that are due (time reached & still UPCOMING)
 */
async function runDueDrawsForGame(game: SchedulerGame) {
  const now = new Date();

  const dueDraws = await prisma.draw.findMany({
    where: { gameId: game.id, drawDate: { lte: now }, status: "UPCOMING" },
    orderBy: { drawNumber: "asc" },
  });

  for (const draw of dueDraws) {
    console.log(`✅ Running Draw #${draw.drawNumber} for ${game.name}`);

    // 🎲 Generate winning numbers
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

    // 🎟️ Fetch tickets
    const tickets = await prisma.ticket.findMany({
      where: { drawId: draw.id, status: TicketStatus.PENDING },
    });

    // 🏆 Parse prize divisions safely
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

    // --- Determine winners per division ---
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

    // --- Calculate & distribute prizes ---
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

        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.WON, payoutCents: payoutPerWinner },
        });
        console.log(
          `🎯 Updated ticket ${ticketId} → payout: $${(
            payoutPerWinner / 100
          ).toLocaleString()}`
        );

        await prisma.user.update({
          where: { id: t.userId },
          data: { creditCents: { increment: payoutPerWinner } },
        });

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

        const user = await prisma.user.findUnique({
          where: { id: t.userId },
          select: { email: true },
        });
        if (user?.email) {
          sendWinEmail(user.email, game.name, payoutPerWinner).catch((err) =>
            console.error("❌ Failed to send win email:", err)
          );
        }
      }

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

    // ❌ Mark all remaining tickets as LOST
    const allWinnerIds = Object.values(divisionWinnersMap).flat();

    if (allWinnerIds.length > 0) {
      await prisma.ticket.updateMany({
        where: {
          drawId: draw.id,
          id: { notIn: allWinnerIds },
        },
        data: { status: TicketStatus.LOST, payoutCents: 0 },
      });
    } else {
      // if absolutely no winners, mark all as lost
      await prisma.ticket.updateMany({
        where: { drawId: draw.id },
        data: { status: TicketStatus.LOST, payoutCents: 0 },
      });
    }

    // ✅ Mark draw complete + store division results
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
    // 💰 Jackpot rollover / sales / payout logic
    const winnerCount = await prisma.ticket.count({
      where: { drawId: draw.id, status: TicketStatus.WON },
    });

    // 🧮 Calculate total payouts from all divisions
    const totalPayoutCents = divisionResults.reduce(
      (sum, d) => sum + d.eachCents * d.winnersCount,
      0
    );

    // 💰 Previous jackpot value
    const prevJackpot = draw.jackpotCents ?? game.baseJackpotCents ?? 0;

    // 🏆 Check if jackpot division (grand prize) was actually won
    const jackpotDivision = divisionResults.find((d) => d.type === "Jackpot");
    const jackpotWinners = jackpotDivision?.winnersCount ?? 0;

    // 🎯 New jackpot calculation
    let nextJackpot = 0;

    if (jackpotWinners > 0) {
      // Jackpot was hit → reset to base amount
      nextJackpot = game.baseJackpotCents ?? 0;
    } else {
      // No jackpot winners → carry over
      const sales = draw.totalSalesCents ?? 0;

      if (sales === 0) {
        // 🟡 No sales → add steady growth (+1000 cents)
        nextJackpot = prevJackpot + 1000;
      } else {
        // 🟢 Add full sales amount when there are sales
        nextJackpot = prevJackpot + sales;
      }
    }

    console.log(
      `💰 Next jackpot for ${game.name}: $${(
        nextJackpot / 100
      ).toLocaleString()} (previous: $${(
        prevJackpot / 100
      ).toLocaleString()}, sales: ${draw.totalSalesCents ?? 0})`
    );

    // 🧾 Update DB with next jackpot info
    await prisma.draw.update({
      where: { id: draw.id },
      data: {
        winnersCount: winnerCount,
        totalPayoutCents,
      },
    });

    // 🧾 Update next draw + game record
    await prisma.draw.update({
      where: { id: draw.id },
      data: { winnersCount: winnerCount },
    });

    await ensureNextDrawExists(game, draw, 6);

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

/**
 * 🧮 Calculates the next draw date for a game, given its draw frequency
 */
function getNextDrawDate(drawFrequency: string, fromDate: Date): Date {
  const next = new Date(fromDate);
  const lower = drawFrequency.toLowerCase();

  // 🟢 Handle very frequent test games (e.g. "Every 5min", "every 10min")
  const minuteMatch = lower.match(/every\s*(\d+)\s*min/);
  if (minuteMatch) {
    const minutes = parseInt(minuteMatch[1], 10);
    next.setMinutes(next.getMinutes() + minutes);
    return next;
  }

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // 🟢 Handle "Daily" draws (every 1 day)
  if (lower.includes("daily")) {
    const timeMatch = lower.match(/(\d+)\s*(am|pm)/);
    const hour =
      timeMatch && timeMatch[2] === "pm"
        ? parseInt(timeMatch[1]) + 12
        : parseInt(timeMatch?.[1] ?? "20");

    next.setHours(hour, 0, 0, 0);
    if (next <= fromDate) next.setDate(next.getDate() + 1);
    return next;
  }

  // 🟢 Handle weekly draws like "Thursday 8 PM"
  const match =
    Object.keys(dayMap).find((d) => lower.includes(d)) || "saturday";
  const targetDay = dayMap[match];
  const currentDay = fromDate.getDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;

  next.setDate(fromDate.getDate() + daysUntil);
  next.setHours(20, 0, 0, 0); // default 8 PM
  return next;
}

/**
 * 🗓️ Ensures there are always N upcoming draws for each game
 */
async function ensureNextDrawExists(
  game: SchedulerGame,
  lastDraw: { drawDate: Date; drawNumber: number },
  count: number = 6
) {
  // 🔹 Get all upcoming draws for this game
  const upcoming: SchedulerDraw[] = await prisma.draw.findMany({
    where: { gameId: game.id, status: "UPCOMING" },
    orderBy: { drawNumber: "asc" },
  });

  // 🔹 Find the latest draw number in DB (not just the one passed)
  const latestDraw = await prisma.draw.findFirst({
    where: { gameId: game.id },
    orderBy: { drawNumber: "desc" },
  });

  let latestDate = latestDraw?.drawDate ?? lastDraw.drawDate;
  let latestNumber = latestDraw?.drawNumber ?? lastDraw.drawNumber;

  // 🔹 Keep track of drawNumbers to avoid duplicates
  const existingNumbers = new Set(upcoming.map((d) => d.drawNumber));

  // 🔹 While we have fewer than the desired upcoming draws, create new ones
  while (upcoming.length < count) {
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

/**
 * 🕒 Main scheduler function — runs periodically based on draw frequency
 */
async function scheduleAllGames() {
  const games = await prisma.game.findMany();
  console.log(`🎯 Loaded ${games.length} games for scheduling.`);

  for (const rawGame of games) {
    // ✅ Safely parse prizeDivisions JSON into real array
    const game: SchedulerGame = {
      ...rawGame,
      prizeDivisions:
        typeof rawGame.prizeDivisions === "string"
          ? JSON.parse(rawGame.prizeDivisions)
          : rawGame.prizeDivisions ?? null,
    };

    const cronExpr = getCronExpression(game.drawFrequency ?? "daily 9 PM");

    // Run every time the cron triggers (weekly/daily)
    cron.schedule(
      cronExpr,
      async () => {
        await runDueDrawsForGame(game);
      },
      { timezone: "Australia/Brisbane" }
    );

    console.log(
      `⏰ Scheduled ${game.name} (${
        game.drawFrequency ?? "daily 9 PM"
      }) → ${cronExpr}`
    );

    await runDueDrawsForGame(game);

    // Also ensure an upcoming draw exists on startup
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
      await ensureNextDrawExists(game, latestDraw, 6);
    }
  }
}

// 🚀 Start the scheduler
scheduleAllGames()
  .then(() => console.log("🚀 Draw scheduler running..."))
  .catch((err) => console.error("❌ Scheduler init failed:", err));
