import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, creditCents: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { gameId, numbers, specialNumbers, priceCents } = body;

  try {
    // 🧮 Check for enough credits
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

    // 🎯 Find the next upcoming draw for this game
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

    // 💳 Use transaction to ensure atomic balance + ticket creation
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          creditCents: { decrement: priceCents },
          transactions: {
            create: {
              type: "DEBIT",
              amountCents: priceCents,
              description: `Ticket purchase for game ${gameId}`,
              reference: upcomingDraw.id,
            },
          },
        },
      });

      // Create the ticket
      const ticket = await tx.ticket.create({
        data: {
          userId: user.id,
          gameId,
          drawId: upcomingDraw.id,
          numbers,
          specialNumbers,
          priceCents,
        },
      });

      // Update draw’s total sales
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
