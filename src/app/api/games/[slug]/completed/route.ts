import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    const now = new Date();

    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        draws: {
          where: {
            status: "COMPLETED",
            drawDate: { lte: now },
          },
          orderBy: { drawDate: "desc" },
          take: 20,
          select: {
            id: true,
            drawNumber: true,
            drawDate: true,
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
      draws: game.draws.map((d) => ({
        ...d,
        divisionResults:
          typeof d.divisionResults === "string"
            ? JSON.parse(d.divisionResults)
            : d.divisionResults ?? [],
      })),
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching completed draws:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed draws" },
      { status: 500 }
    );
  }
}
