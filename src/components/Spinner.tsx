"use client";

import { Loader2 } from "lucide-react";

interface SpinnerProps {
  message?: string;
  variant?: "default" | "accent";
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export default function Spinner({
  message,
  variant = "default",
  size = "md",
  fullScreen = false,
}: SpinnerProps) {
  const sizeClasses =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";

  const color = variant === "accent" ? "text-yellow-400" : "text-gray-400";

  const containerClasses = fullScreen
    ? "h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-400"
    : "flex flex-col items-center justify-center gap-2";

  return (
    <div className={containerClasses}>
      {/* Spinner icon */}
      <Loader2 className={`animate-spin ${sizeClasses} ${color}`} />

      {/* Message below */}
      {message && (
        <span className="mt-3 text-md text-gray-400 animate-fadeIn text-center">
          {message}
        </span>
      )}
    </div>
  );
}
