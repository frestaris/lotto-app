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
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      include: {
        game: { select: { name: true, logoUrl: true } },
        draw: {
          select: {
            drawNumber: true,
            drawDate: true,
            status: true,
            winningMainNumbers: true,
            winningSpecialNumbers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enhanced = tickets.map((t) => {
      const draw = t.draw;

      // ✅ handle possible null draw
      if (!draw) {
        return { ...t, won: false };
      }

      const won =
        draw.status === "COMPLETED" &&
        Array.isArray(draw.winningMainNumbers) &&
        t.numbers.some((n) => draw.winningMainNumbers.includes(n));

      return { ...t, won };
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
