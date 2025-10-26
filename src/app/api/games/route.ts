import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/games
 * Returns all active lotto games with their current live jackpot + prize divisions
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
          take: 1,
          select: {
            id: true,
            jackpotCents: true,
            drawDate: true,
          },
        },
      },
    });

    const formattedGames = games.map((g) => ({
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

      // include these two explicitly
      baseJackpotCents: g.baseJackpotCents,
      currentJackpotCents: g.currentJackpotCents,

      // 🧮 derived live jackpot
      jackpotCents:
        g.draws[0]?.jackpotCents ?? g.currentJackpotCents ?? g.baseJackpotCents,

      prizeDivisions:
        typeof g.prizeDivisions === "string"
          ? JSON.parse(g.prizeDivisions)
          : g.prizeDivisions,
    }));

    return NextResponse.json(formattedGames, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
