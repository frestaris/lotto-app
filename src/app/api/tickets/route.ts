import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, creditCents: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { gameId, numbers, specialNumbers, priceCents } = body;

  try {
    if (user.creditCents < priceCents) {
      return NextResponse.json(
        {
          error: "Insufficient credits. Please add more to continue.",
          currentBalance: user.creditCents,
          required: priceCents,
        },
        { status: 400 }
      );
    }

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

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, name: true, priceCents: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          creditCents: { decrement: priceCents },
          transactions: {
            create: {
              type: "TICKET_PURCHASE",
              gameId: game.id,
              drawId: upcomingDraw.id,
              amountCents: priceCents,
              description: `Ticket purchase for ${game.name}`,
              reference: upcomingDraw.id,
            },
          },
        },
      });

      const ticket = await tx.ticket.create({
        data: {
          userId: user.id,
          gameId: game.id,
          drawId: upcomingDraw.id,
          numbers,
          specialNumbers,
          priceCents,
        },
      });

      await tx.draw.update({
        where: { id: upcomingDraw.id },
        data: { totalSalesCents: { increment: priceCents } },
      });

      return { ticket, updatedUser };
    });

    return NextResponse.json(
      {
        message: "Ticket purchased successfully",
        ticket: result.ticket,
        updatedBalance: result.updatedUser.creditCents,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Ticket creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
