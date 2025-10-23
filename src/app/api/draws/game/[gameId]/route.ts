import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/draws/game/:gameId
 * Returns all draws for a specific game
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ gameId: string }> } // ✅ context object
) {
  try {
    // ✅ await params from context
    const { gameId } = await context.params;

    const draws = await prisma.draw.findMany({
      where: { gameId },
      orderBy: { drawNumber: "desc" },
    });

    if (!draws || draws.length === 0) {
      return NextResponse.json(
        { message: "No draws found for this game." },
        { status: 404 }
      );
    }

    return NextResponse.json(draws, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching draws by game:", error);
    return NextResponse.json(
      { error: "Failed to fetch draws" },
      { status: 500 }
    );
  }
}
