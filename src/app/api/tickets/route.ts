export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface IncomingTicket {
  gameId: string;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
}

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

  let tickets: IncomingTicket[] = [];

  if (Array.isArray(body)) tickets = body;
  else if (Array.isArray(body.tickets)) tickets = body.tickets;
  else tickets = [body];

  if (tickets.length === 0) {
    return NextResponse.json({ error: "No tickets provided" }, { status: 400 });
  }

  const totalPriceCents = tickets.reduce(
    (sum, t) => sum + (t.priceCents ?? 0),
    0
  );

  if (user.creditCents < totalPriceCents) {
    return NextResponse.json(
      {
        error: "Insufficient credits",
        currentBalance: user.creditCents,
        required: totalPriceCents,
      },
      { status: 400 }
    );
  }

  // ===============================
  // Fetch upcoming draws for games
  // ===============================
  const gameIds = [...new Set(tickets.map((t) => t.gameId))];
  const now = new Date();

  const upcomingDraws = await prisma.draw.findMany({
    where: { gameId: { in: gameIds }, drawDate: { gt: now } },
    orderBy: { drawDate: "asc" },
  });

  const drawMap = new Map<string, (typeof upcomingDraws)[number]>();

  for (const d of upcomingDraws) {
    if (!drawMap.has(d.gameId)) drawMap.set(d.gameId, d);
  }

  for (const t of tickets) {
    if (!drawMap.get(t.gameId)) {
      return NextResponse.json(
        { error: `No upcoming draw available for game ${t.gameId}` },
        { status: 400 }
      );
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct credits once
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { creditCents: { decrement: totalPriceCents } },
      });

      // 2. Build ticket batch
      const ticketData = tickets.map((t) => ({
        userId,
        gameId: t.gameId,
        drawId: drawMap.get(t.gameId)!.id,
        numbers: t.numbers,
        specialNumbers: t.specialNumbers,
        priceCents: t.priceCents,
      }));

      await tx.ticket.createMany({ data: ticketData });

      // Re-fetch created tickets because createMany doesn't return them
      const createdTickets = await tx.ticket.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: ticketData.length,
      });

      // 3. Build wallet transaction batch
      const walletData = ticketData.map((t) => ({
        userId,
        type: "TICKET_PURCHASE",
        gameId: t.gameId,
        drawId: t.drawId,
        amountCents: t.priceCents,
        description: `Ticket purchase for game ${t.gameId}`,
        reference: t.drawId,
      }));

      await tx.walletTransaction.createMany({ data: walletData });

      // 4. Aggregate draw updates
      const salesByDraw: Record<string, number> = {};

      for (const t of tickets) {
        const drawId = drawMap.get(t.gameId)!.id;
        salesByDraw[drawId] = (salesByDraw[drawId] ?? 0) + t.priceCents;
      }

      for (const [drawId, total] of Object.entries(salesByDraw)) {
        await tx.draw.update({
          where: { id: drawId },
          data: { totalSalesCents: { increment: total } },
        });
      }

      return { updatedUser, createdTickets };
    });

    return NextResponse.json(
      {
        message:
          tickets.length === 1
            ? "Ticket purchased successfully"
            : `${tickets.length} tickets purchased successfully`,
        tickets: result.createdTickets,
        updatedBalance: result.updatedUser.creditCents,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Ticket creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create tickets" },
      { status: 500 }
    );
  }
}
