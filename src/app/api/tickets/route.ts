import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

interface DecodedToken extends JwtPayload {
  userId?: string;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let userId: string | undefined;

  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET!
    ) as DecodedToken;
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const result = await prisma.$transaction(async (tx) => {
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
