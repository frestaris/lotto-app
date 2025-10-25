import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/games
 * Returns all active lotto games with their current (live) jackpots
 */
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        draws: {
          where: { status: "UPCOMING" },
          orderBy: { drawDate: "asc" },
          take: 1, // only the next draw
          select: {
            jackpotCents: true,
            totalSalesCents: true,
          },
        },
      },
    });

    const formattedGames = games.map((g) => {
      const draw = g.draws[0];

      // Base jackpot (fallbacks if needed)
      const baseJackpot =
        g.currentJackpotCents && g.currentJackpotCents > 0
          ? g.currentJackpotCents
          : g.baseJackpotCents;

      // Calculate live jackpot growth
      const liveJackpot =
        draw && draw.jackpotCents != null
          ? draw.jackpotCents +
            Math.floor(
              (draw.totalSalesCents ?? 0) * (g.jackpotGrowthPct ?? 0) * 10
            )
          : baseJackpot;

      return {
        id: g.id,
        slug: g.slug,
        name: g.name,
        description: g.description,
        logoUrl: g.logoUrl,
        priceCents: g.priceCents,
        drawFrequency: g.drawFrequency,
        jackpotCurrency: g.jackpotCurrency,
        isActive: g.isActive,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,

        // 🧮 jackpots
        baseJackpotCents: g.baseJackpotCents,
        currentJackpotCents: liveJackpot, // 🟢 live, dynamic amount
      };
    });

    return NextResponse.json(formattedGames, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
