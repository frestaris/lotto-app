import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * GET /api/tickets/user
 * Returns all tickets for that month (no pagination)
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    // Build date filter if month provided
    let dateFilter = {};
    if (month) {
      const start = new Date(`${month}-01T00:00:00Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      dateFilter = {
        draw: {
          drawDate: {
            gte: start,
            lt: end,
          },
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch all tickets for that month
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
        ...dateFilter,
      },
      include: {
        game: {
          select: { name: true, slug: true, iconName: true },
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
      orderBy: {
        draw: { drawDate: "desc" },
      },
    });

    // Enhance tickets with result info
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

    return NextResponse.json({ tickets: enhanced }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching user tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
