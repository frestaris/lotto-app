import Image from "next/image";
import { Game } from "@prisma/client";

interface GameHeaderProps {
  game: Game;
}

export default function GameHeader({ game }: GameHeaderProps) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 py-16 px-6 border-b border-white/10">
      <div className="relative w-56 h-56 bg-black rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
        <Image
          src={game.logoUrl || "/images/powerball.png"}
          alt={game.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-contain p-6"
        />
      </div>

      <div className="flex-1 space-y-4">
        <h1 className="text-4xl font-bold text-yellow-400">{game.name}</h1>
        <p className="text-gray-300">{game.description}</p>

        <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
          <span className="bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            🎟️ Price:{" "}
            <span className="text-yellow-400">
              ${(game.priceCents / 100).toFixed(2)}
            </span>
          </span>
          <span className="bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            🔢 Picks: {game.mainPickCount} numbers
          </span>
          {game.specialPickCount > 0 && (
            <span className="bg-white/10 px-4 py-2 rounded-lg border border-white/10">
              ⭐ +{game.specialPickCount} special
            </span>
          )}
          <span className="bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            📅 Draw: {game.drawFrequency || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
