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

  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      include: {
        game: { select: { name: true, iconName: true, slug: true } },
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

      if (t.status === "WON") result = "WON";
      else if (t.status === "LOST") result = "LOST";
      else if (t.draw?.status === "UPCOMING") result = "PENDING";

      // ✅ strongly type divisionResults as array
      const divisionResults = t.draw?.divisionResults
        ? (t.draw.divisionResults as {
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
