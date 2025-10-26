"use client";

import { Loader2 } from "lucide-react";

interface SpinnerProps {
  /** Optional text under the spinner */
  message?: string;
  /** 'light' = default gray text, 'accent' = yellow highlight */
  variant?: "light" | "accent";
}

export default function Spinner({
  message = "Loading...",
  variant = "light",
}: SpinnerProps) {
  const color = variant === "accent" ? "text-yellow-400" : "text-gray-400";

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] overflow-hidden select-none">
      <Loader2 className={`w-16 h-16 animate-spin ${color}`} />
      <p className={`text-lg font-medium ${color}`}>{message}</p>
    </div>
  );
}
