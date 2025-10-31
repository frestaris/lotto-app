import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // ✅ must await in Next.js 15+

  try {
    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        draws: {
          orderBy: { drawDate: "asc" },
          take: 10,
          select: {
            id: true,
            drawNumber: true,
            drawDate: true,
            status: true,
            jackpotCents: true,
            winningMainNumbers: true,
            winningSpecialNumbers: true,
            divisionResults: true,
          },
        },
      },
    });

    if (!game)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });

    const formatted = {
      ...game,
      prizeDivisions:
        typeof game.prizeDivisions === "string"
          ? JSON.parse(game.prizeDivisions)
          : game.prizeDivisions,
      draws: game.draws.map((d) => ({
        ...d,
        divisionResults:
          typeof d.divisionResults === "string"
            ? JSON.parse(d.divisionResults)
            : d.divisionResults,
      })),
      jackpotCents:
        game.draws.find((d) => d.status === "UPCOMING")?.jackpotCents ??
        game.currentJackpotCents ??
        game.baseJackpotCents ??
        0,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
