import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/games/[slug]
 * Returns a single game by its slug
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    const game = await prisma.game.findUnique({
      where: { slug },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // ✅ Parse prizeDivisions JSON if stored as a string
    let prizeDivisions = null;
    if (game.prizeDivisions) {
      try {
        prizeDivisions =
          typeof game.prizeDivisions === "string"
            ? JSON.parse(game.prizeDivisions)
            : game.prizeDivisions;
      } catch {
        console.warn("⚠️ Failed to parse prizeDivisions JSON");
      }
    }

    return NextResponse.json({ ...game, prizeDivisions }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
