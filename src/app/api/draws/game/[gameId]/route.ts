import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const draws = await prisma.draw.findMany({
      where: { gameId: params.gameId },
      orderBy: { drawDate: "desc" },
      select: {
        id: true,
        drawNumber: true,
        drawDate: true,
        status: true,
        jackpotAmountCents: true,
        winningMainNumbers: true,
        winningSpecialNumbers: true,
        createdAt: true,
      },
    });

    return NextResponse.json(draws, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching draws:", err);
    return NextResponse.json(
      { error: "Failed to fetch draws" },
      { status: 500 }
    );
  }
}
