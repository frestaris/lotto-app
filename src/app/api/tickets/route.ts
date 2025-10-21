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
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { gameId, drawId, numbers, specialNumbers, priceCents } = body;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        gameId,
        drawId,
        numbers,
        specialNumbers,
        priceCents,
      },
    });

    return NextResponse.json(ticket);
  } catch (err) {
    console.error("Ticket creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
