"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export default function PowerballPage() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [powerball, setPowerball] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const generateNumbers = () => {
    setLoading(true);
    setTimeout(() => {
      const balls = new Set<number>();
      while (balls.size < 6) {
        balls.add(Math.floor(Math.random() * 69) + 1); // Powerball main numbers 1–69
      }
      setNumbers(Array.from(balls).sort((a, b) => a - b));
      setPowerball(Math.floor(Math.random() * 26) + 1); // Powerball 1–26
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-3">Powerball</h1>
      <p className="text-gray-300 mb-8 text-center max-w-xl">
        Pick 5 numbers between <span className="font-semibold">1–69</span> and 1
        Powerball number between <span className="font-semibold">1–26</span>.
      </p>

      <div className="flex gap-4 flex-wrap justify-center mb-10">
        {numbers.length > 0 ? (
          numbers.map((n, i) => (
            <div
              key={i}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black font-bold text-xl shadow-md"
            >
              {n}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            Click “Generate Numbers” to start
          </p>
        )}

        {powerball && (
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 text-white font-bold text-xl shadow-md">
            {powerball}
          </div>
        )}
      </div>

      <button
        onClick={generateNumbers}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" /> Generate Numbers
          </>
        )}
      </button>
    </div>
  );
}
