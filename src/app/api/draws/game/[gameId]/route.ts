import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;

    const draws = await prisma.draw.findMany({
      where: { gameId },
      orderBy: { drawDate: "desc" },
      select: {
        id: true,
        drawNumber: true,
        drawDate: true,
        status: true,
        jackpotCents: true,
        winningMainNumbers: true,
        winningSpecialNumbers: true,
        divisionResults: true, // ✅ include division results
        createdAt: true,
      },
    });

    // ✅ Safely parse divisionResults JSON for all draws
    const formattedDraws = draws.map((d) => {
      let divisionResults = null;
      if (d.divisionResults) {
        try {
          divisionResults =
            typeof d.divisionResults === "string"
              ? JSON.parse(d.divisionResults)
              : d.divisionResults;
        } catch {
          console.warn(`⚠️ Failed to parse divisionResults for draw ${d.id}`);
        }
      }

      return { ...d, divisionResults };
    });

    return NextResponse.json(formattedDraws, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching draws:", err);
    return NextResponse.json(
      { error: "Failed to fetch draws" },
      { status: 500 }
    );
  }
}
