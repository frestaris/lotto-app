import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/draws/latest
 * Always returns the draw closest to today (completed or upcoming)
 */
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      include: {
        draws: {
          orderBy: { drawDate: "asc" }, // we'll sort manually afterward
          select: {
            drawNumber: true,
            drawDate: true,
            jackpotAmountCents: true,
            status: true,
            winningMainNumbers: true,
            winningSpecialNumbers: true,
          },
        },
      },
    });

    const now = new Date();

    const formatted = games
      .map((g) => {
        // find draw closest to 'now' (either before or after)
        const closest = g.draws.reduce((prev, curr) => {
          const diffPrev = Math.abs(
            new Date(prev.drawDate).getTime() - now.getTime()
          );
          const diffCurr = Math.abs(
            new Date(curr.drawDate).getTime() - now.getTime()
          );
          return diffCurr < diffPrev ? curr : prev;
        }, g.draws[0]);

        return {
          gameId: g.id,
          gameName: g.name,
          logoUrl: g.logoUrl,
          drawNumber: closest.drawNumber,
          drawDate: closest.drawDate,
          jackpotAmountCents: closest.jackpotAmountCents,
          status: closest.status,
          winningMainNumbers: closest.winningMainNumbers ?? [],
          winningSpecialNumbers: closest.winningSpecialNumbers ?? [],
        };
      })
      .filter(Boolean);

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching latest draws:", error);
    return NextResponse.json(
      { error: "Failed to fetch draw results" },
      { status: 500 }
    );
  }
}
