import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * GET /api/tickets/user
 * Returns all tickets for the logged-in user with game + draw info
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        game: {
          select: {
            name: true,
            slug: true,
            iconName: true,
          },
        },
        draw: {
          select: {
            drawNumber: true,
            drawDate: true,
            status: true,
            winningMainNumbers: true,
            winningSpecialNumbers: true,
            divisionResults: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enhanced = tickets.map((t) => {
      let result: "WON" | "LOST" | "PENDING" = "PENDING";

      if (t.draw?.status === "COMPLETED") {
        if (t.payoutCents && t.payoutCents > 0) result = "WON";
        else result = "LOST";
      }

      const divisionResults = Array.isArray(t.draw?.divisionResults)
        ? (t.draw!.divisionResults as {
            type: string;
            poolCents: number;
            winnersCount: number;
            eachCents: number;
          }[])
        : [];

      const winningDivision = divisionResults.find(
        (d) => d.eachCents === t.payoutCents && d.winnersCount > 0
      );

      return {
        ...t,
        result,
        payoutCents: t.payoutCents ?? 0,
        division: winningDivision?.type ?? null,
      };
    });

    return NextResponse.json(enhanced, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching user tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
