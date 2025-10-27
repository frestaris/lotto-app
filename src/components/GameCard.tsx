"use client";

import React from "react";

export default function GameCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border border-white/10
      bg-gradient-to-b from-[#161616] to-[#0a0a0a]
      overflow-hidden transition-all duration-300
      hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]
      hover:border-yellow-400/20 h-full
      ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}
      ${className}`}
    >
      {/* glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.08)_0%,transparent_70%)] blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3 h-full justify-between">
        {children}
      </div>
    </div>
  );
}
