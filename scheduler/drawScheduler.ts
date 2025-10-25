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

  // 1️⃣ Find all draws whose drawDate <= now and are still UPCOMING
  const dueDraws = await prisma.draw.findMany({
    where: { gameId: game.id, drawDate: { lte: now }, status: "UPCOMING" },
    orderBy: { drawNumber: "asc" },
  });

  for (const draw of dueDraws) {
    console.log(`✅ Running Draw #${draw.drawNumber} for ${game.name}`);

    // 2️⃣ Generate winning numbers
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

    // 3️⃣ Evaluate all tickets attached to this draw
    const tickets = await prisma.ticket.findMany({
      where: { drawId: draw.id, status: TicketStatus.PENDING },
    });

    // 🧮 Phase 3 — Prize division + wallet crediting
    const divisions =
      (game.prizeDivisions as
        | {
            matchMain: number;
            matchSpecial?: number;
            percentage?: number;
            fixed?: number;
            type: string;
          }[]
        | null) ?? null;

    for (const ticket of tickets) {
      const mainMatches = ticket.numbers.filter((n) =>
        winningMainNumbers.includes(n)
      ).length;
      const specialMatches = ticket.specialNumbers.filter((n) =>
        winningSpecialNumbers.includes(n)
      ).length;

      let payoutCents = 0;
      let result: TicketStatus = TicketStatus.LOST;

      if (divisions && divisions.length > 0) {
        // check for matching division rule
        for (const rule of divisions) {
          const mainOk = mainMatches === rule.matchMain;
          const specialOk = (specialMatches ?? 0) === (rule.matchSpecial ?? 0);

          if (mainOk && specialOk) {
            const safeJackpot = draw.jackpotCents ?? game.baseJackpotCents ?? 0;

            payoutCents = rule.fixed
              ? rule.fixed
              : Math.floor(safeJackpot * (rule.percentage ?? 0));

            result = TicketStatus.WON;
            break;
          }
        }
      } else {
        // fallback: only exact match wins jackpot
        const fullMatch =
          mainMatches === game.mainPickCount &&
          specialMatches === game.specialPickCount;
        if (fullMatch) {
          payoutCents = draw.jackpotCents ?? game.baseJackpotCents ?? 0;
          result = TicketStatus.WON;
        }
      }

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: result, payoutCents },
      });

      // 💳 Credit wallet and log transaction
      if (result === TicketStatus.WON && payoutCents > 0) {
        await prisma.user.update({
          where: { id: ticket.userId },
          data: { creditCents: { increment: payoutCents } },
        });

        await prisma.walletTransaction.create({
          data: {
            userId: ticket.userId,
            type: "CREDIT",
            amountCents: payoutCents,
            reference: draw.id,
            description: `Prize payout for draw #${draw.drawNumber} (${game.name})`,
          },
        });
        const user = await prisma.user.findUnique({
          where: { id: ticket.userId },
          select: { email: true },
        });

        if (user?.email) {
          // fire and forget — no need to block the loop
          sendWinEmail(user.email, game.name, payoutCents).catch((err) =>
            console.error("❌ Failed to send win email:", err)
          );
        }
      }

      console.log(
        `🎟️ Ticket ${ticket.id} → ${
          result === TicketStatus.WON ? "🏆 WON" : "❌ LOST"
        } | main ${mainMatches}/${
          game.mainPickCount
        }, special ${specialMatches}/${game.specialPickCount}`
      );
    }

    // 4️⃣ Mark draw as completed
    await prisma.draw.update({
      where: { id: draw.id },
      data: {
        status: "COMPLETED",
        winningMainNumbers,
        winningSpecialNumbers,
      },
    });

    console.log(`🎉 Completed draw ${draw.drawNumber} for ${game.name}`);

    // 🧮 Phase 4 — Jackpot rollover / reset
    const winnerCount = await prisma.ticket.count({
      where: { drawId: draw.id, status: TicketStatus.WON },
    });

    let nextJackpot = 0;
    if (winnerCount > 0) {
      // winners → reset jackpot
      nextJackpot = game.baseJackpotCents ?? 0;
    } else {
      // no winners → roll over and grow
      nextJackpot =
        (draw.jackpotCents ?? game.baseJackpotCents ?? 0) +
        draw.totalSalesCents;
    }

    await prisma.draw.update({
      where: { id: draw.id },
      data: { winnersCount: winnerCount },
    });

    // ensure a next draw exists
    await ensureNextDrawExists(game, draw, 6);

    // update next draw jackpot
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
    }
  }
}

/**
 * 🧮 Calculates the next draw date for a game, given its draw frequency
 */
function getNextDrawDate(drawFrequency: string, fromDate: Date): Date {
  const next = new Date(fromDate);
  const lower = drawFrequency.toLowerCase();

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
  // get all current upcoming draws
  const upcoming: SchedulerDraw[] = await prisma.draw.findMany({
    where: { gameId: game.id, status: "UPCOMING" },
    orderBy: { drawNumber: "asc" },
  });

  // track the most recent date/number
  let latestDate = lastDraw.drawDate;
  let latestNumber = lastDraw.drawNumber;

  // while less than desired upcoming draws, add new ones
  while (upcoming.length < count) {
    const nextDate = getNextDrawDate(
      game.drawFrequency ?? "Saturday 8 PM",
      latestDate
    );

    const newDraw = await prisma.draw.create({
      data: {
        gameId: game.id,
        drawNumber: ++latestNumber,
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

    // ✅ Push with correct type, no any
    upcoming.push(newDraw);
    latestDate = nextDate;
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
      prizeDivisions: rawGame.prizeDivisions
        ? (JSON.parse(
            rawGame.prizeDivisions as unknown as string
          ) as SchedulerGame["prizeDivisions"])
        : null,
    };

    const cronExpr = getCronExpression(game.drawFrequency ?? "daily 9 PM");

    // Run every time the cron triggers (weekly/daily)
    cron.schedule(cronExpr, async () => {
      await runDueDrawsForGame(game);
    });

    console.log(
      `⏰ Scheduled ${game.name} (${
        game.drawFrequency ?? "daily 9 PM"
      }) → ${cronExpr}`
    );

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
