import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        iconName: true,
        priceCents: true,
        drawFrequency: true,
        currentJackpotCents: true,
        baseJackpotCents: true,
        draws: {
          where: { status: "UPCOMING" },
          orderBy: { drawDate: "asc" },
          take: 1,
          select: {
            jackpotCents: true,
            drawDate: true,
          },
        },
      },
    });

    const formatted = games.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      iconName: g.iconName,
      priceCents: g.priceCents,
      drawFrequency: g.drawFrequency,
      nextDrawDate: g.draws[0]?.drawDate ?? null,

      // Always fallback
      jackpotCents:
        g.draws?.[0]?.jackpotCents ??
        g.currentJackpotCents ??
        g.baseJackpotCents ??
        0,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching light games:", err);
    return NextResponse.json(
      { error: "Failed to load games" },
      { status: 500 }
    );
  }
}
