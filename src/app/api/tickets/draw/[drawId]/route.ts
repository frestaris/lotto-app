import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ drawId: string }> }
) {
  const { drawId } = await context.params;

  try {
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: { game: true },
    });

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    // 🟢 Use saved divisionResults if they exist
    let divisionResults = null;
    if (draw.divisionResults) {
      try {
        divisionResults =
          typeof draw.divisionResults === "string"
            ? JSON.parse(draw.divisionResults)
            : draw.divisionResults;
      } catch {
        console.warn(`⚠️ Failed to parse divisionResults for draw ${draw.id}`);
      }
    }

    // 🟠 Fallback: recalc from DB if draw.divisionResults is null
    if (!divisionResults) {
      const tickets = await prisma.ticket.findMany({
        where: { drawId },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      const divisions =
        (draw.game.prizeDivisions as {
          matchMain: number;
          matchSpecial?: number;
          percentage?: number;
          fixed?: number;
          type: string;
        }[]) ?? [];

      divisionResults = divisions.map((div) => {
        const winners = tickets.filter((t) => {
          const mainMatches = t.numbers.filter((n) =>
            draw.winningMainNumbers.includes(n)
          ).length;
          const specialMatches = t.specialNumbers.filter((n) =>
            draw.winningSpecialNumbers.includes(n)
          ).length;
          return (
            mainMatches === div.matchMain &&
            (div.matchSpecial == null || specialMatches === div.matchSpecial)
          );
        });

        return {
          ...div,
          winnersCount: winners.length,
        };
      });
    }

    const tickets = await prisma.ticket.findMany({
      where: { drawId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ tickets, divisionResults }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch tickets by draw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
