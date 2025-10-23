import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/draws/latest
 * Returns the most recent draw per active game
 */
export async function GET() {
  try {
    const latestDraws = await prisma.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        draws: {
          take: 1,
          orderBy: { drawNumber: "desc" },
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

    const formatted = latestDraws
      .filter((g) => g.draws.length)
      .map((g) => ({
        gameId: g.id,
        gameName: g.name,
        logoUrl: g.logoUrl,
        ...g.draws[0],
        winningMainNumbers: g.draws[0].winningMainNumbers ?? [],
        winningSpecialNumbers: g.draws[0].winningSpecialNumbers ?? [],
      }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching latest draws:", error);
    return NextResponse.json(
      { error: "Failed to fetch draw results" },
      { status: 500 }
    );
  }
}
