import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { gameId, numbers, specialNumbers, priceCents } = body;

  try {
    // 1️⃣ Find the next upcoming draw for this game
    const now = new Date();
    const upcomingDraw = await prisma.draw.findFirst({
      where: { gameId, drawDate: { gt: now } },
      orderBy: { drawDate: "asc" },
    });

    if (!upcomingDraw) {
      return NextResponse.json(
        { error: "No upcoming draw available for this game" },
        { status: 400 }
      );
    }

    // 2️⃣ Create the ticket linked to that draw
    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        gameId,
        drawId: upcomingDraw.id,
        numbers,
        specialNumbers,
        priceCents,
      },
    });
    // 3️⃣ Increment total sales for the draw (for jackpot growth)
    await prisma.draw.update({
      where: { id: upcomingDraw.id },
      data: { totalSalesCents: { increment: priceCents } },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Ticket creation failed:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    console.error("❌ Ticket creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
