"use client";
import Image from "next/image";
import Link from "next/link";

const games = [
  {
    id: 1,
    name: "Powerball",
    image: "/images/powerball.png",
    nextDraw: "Thursday, Oct 24",
    jackpot: "$60 Million",
    href: "/games/powerball",
  },
  {
    id: 2,
    name: "Oz Lotto",
    image: "/images/powerball.png",
    nextDraw: "Tuesday, Oct 22",
    jackpot: "$30 Million",
    href: "/games/ozlotto",
  },
  {
    id: 3,
    name: "Set for Life",
    image: "/images/powerball.png",
    nextDraw: "Tonight",
    jackpot: "$20,000 a month for 20 years",
    href: "/games/set-for-life",
  },
  {
    id: 4,
    name: "Lotto",
    image: "/images/powerball.png",
    nextDraw: "Saturday, Oct 26",
    jackpot: "$10 Million",
    href: "/games/lotto",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white">
      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Play Your Favourite <span className="text-yellow-400">Lotto</span>{" "}
          Games
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Choose your lucky numbers, play online, and check results all in one
          place.
        </p>
      </section>

      {/* Games Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {games.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className="group bg-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-white/10"
          >
            <div className="relative h-48 bg-black">
              <Image
                src={game.image}
                alt={game.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold group-hover:text-yellow-400">
                {game.name}
              </h2>
              <p className="text-sm text-gray-400">{game.nextDraw}</p>
              <p className="text-lg font-medium text-yellow-400">
                {game.jackpot}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
