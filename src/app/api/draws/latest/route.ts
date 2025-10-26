import { NextResponse } from "next/server";
import { PrismaClient, DrawStatus } from "@prisma/client";
import { hasDrawTimePassed } from "@/utils/hasDrawTimePassed";

const prisma = new PrismaClient();

type DisplayStatus = DrawStatus | "TODAY";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      include: {
        draws: {
          orderBy: { drawDate: "asc" },
          select: {
            id: true,
            drawNumber: true,
            drawDate: true,
            jackpotCents: true,
            status: true,
            winningMainNumbers: true,
            winningSpecialNumbers: true,
          },
        },
      },
    });

    const now = new Date();

    const formatted = games.map((g) => {
      const draws = g.draws;
      if (draws.length === 0) return null;

      // 1️⃣ Latest completed draw
      const completed = draws
        .filter((d) => d.status === "COMPLETED" && new Date(d.drawDate) <= now)
        .sort(
          (a, b) =>
            new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
        )[0];

      // 2️⃣ If no completed, find today's upcoming
      const todayUpcoming = draws.find(
        (d) =>
          d.status === "UPCOMING" &&
          new Date(d.drawDate).toDateString() === now.toDateString()
      );

      // 3️⃣ Otherwise, next upcoming
      const nextUpcoming = draws.find(
        (d) => d.status === "UPCOMING" && new Date(d.drawDate) > now
      );

      const target = completed || todayUpcoming || nextUpcoming;
      let displayStatus: DisplayStatus = target?.status ?? "UPCOMING";

      // If it's today and not yet drawn → mark as "TODAY"
      if (
        target?.status === "UPCOMING" &&
        todayUpcoming &&
        todayUpcoming.id === target.id &&
        !hasDrawTimePassed(new Date(target.drawDate), g.drawFrequency)
      ) {
        displayStatus = "TODAY";
      }

      return target
        ? {
            gameId: g.id,
            gameName: g.name,
            iconName: g.iconName,
            drawNumber: target.drawNumber,
            drawDate: target.drawDate,
            jackpotCents: target.jackpotCents,
            winningMainNumbers: target.winningMainNumbers ?? [],
            winningSpecialNumbers: target.winningSpecialNumbers ?? [],
            dbStatus: target.status,
            displayStatus,
          }
        : null;
    });

    return NextResponse.json(formatted.filter(Boolean), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching latest draws:", error);
    return NextResponse.json(
      { error: "Failed to fetch draw results" },
      { status: 500 }
    );
  }
}
