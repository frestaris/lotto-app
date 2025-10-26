import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;

    const draws = await prisma.draw.findMany({
      where: { gameId },
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
    });

    const formatted = draws.map((d) => ({
      ...d,
      divisionResults:
        typeof d.divisionResults === "string"
          ? JSON.parse(d.divisionResults)
          : d.divisionResults,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching draws:", err);
    return NextResponse.json(
      { error: "Failed to fetch draws" },
      { status: 500 }
    );
  }
}
