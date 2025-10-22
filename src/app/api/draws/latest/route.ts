import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/draws/latest
 * Returns the most recent draw per game
 */
export async function GET() {
  try {
    // Get all active games
    const games = await prisma.game.findMany({
      where: { isActive: true },
      select: { id: true, name: true, logoUrl: true },
    });

    // For each game, fetch its latest draw
    const results = await Promise.all(
      games.map(async (game) => {
        const latestDraw = await prisma.draw.findFirst({
          where: { gameId: game.id },
          orderBy: { drawNumber: "desc" },
        });
        if (!latestDraw) return null;
        return {
          gameId: game.id,
          gameName: game.name,
          logoUrl: game.logoUrl,
          drawNumber: latestDraw.drawNumber,
          drawDate: latestDraw.drawDate,
          winningMainNumbers: latestDraw.winningMainNumbers,
          winningSpecialNumbers: latestDraw.winningSpecialNumbers,
        };
      })
    );

    const filtered = results.filter(Boolean);
    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching latest draws:", error);
    return NextResponse.json(
      { error: "Failed to fetch draw results" },
      { status: 500 }
    );
  }
}
