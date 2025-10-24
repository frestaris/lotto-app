import cron from "node-cron";
import { PrismaClient, TicketStatus, type Game } from "@prisma/client";

import dotenv from "dotenv";
import { generateNumbers } from "../src/utils/generateNumbers.ts";
import { getCronExpression } from "../src/utils/getCronExpression.ts";

dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

/**
 * 🔁 Run all draws that are due (time reached & still UPCOMING)
 */
async function runDueDrawsForGame(game: Game) {
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

    // 5️⃣ Ensure next upcoming draw exists
    await ensureNextDrawExists(game, draw);
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
 * 🗓️ Ensures there is always at least one upcoming draw for each game
 */
async function ensureNextDrawExists(
  game: Game,
  lastDraw: { drawDate: Date; drawNumber: number }
) {
  const existing = await prisma.draw.findFirst({
    where: { gameId: game.id, drawDate: { gt: lastDraw.drawDate } },
  });

  if (existing) return; // upcoming draw already exists

  const nextDate = getNextDrawDate(
    game.drawFrequency ?? "Saturday 8 PM",
    lastDraw.drawDate
  );

  await prisma.draw.create({
    data: {
      gameId: game.id,
      drawNumber: lastDraw.drawNumber + 1,
      drawDate: nextDate,
      winningMainNumbers: [],
      winningSpecialNumbers: [],
      status: "UPCOMING",
    },
  });

  console.log(
    `📅 Created next draw for ${game.name} → ${nextDate.toISOString()}`
  );
}

/**
 * 🕒 Main scheduler function — runs periodically based on draw frequency
 */
async function scheduleAllGames() {
  const games = await prisma.game.findMany();
  console.log(`🎯 Loaded ${games.length} games for scheduling.`);

  for (const game of games) {
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
        },
      });

      console.log(
        `🆕 Created initial draw for ${
          game.name
        } → ${firstDrawDate.toISOString()}`
      );
    } else {
      await ensureNextDrawExists(game, latestDraw);
    }
  }
}

// 🚀 Start the scheduler
scheduleAllGames()
  .then(() => console.log("🚀 Draw scheduler running..."))
  .catch((err) => console.error("❌ Scheduler init failed:", err));
