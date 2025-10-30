"use client";

import Link from "next/link";
import Spinner from "@/components/Spinner";

interface EmptyStateProps {
  message?: string;
  buttonLabel?: string;
  href?: string;
  loading?: boolean;
}

export default function EmptyState({
  message,
  buttonLabel,
  href,
  loading,
}: EmptyStateProps) {
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center text-gray-400 text-center px-4">
        <Spinner variant="accent" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center text-gray-400 text-center px-4 space-y-4">
      {message && <p className="text-lg">{message}</p>}

      {href && buttonLabel && (
        <Link
          href={href}
          className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          {buttonLabel}
        </Link>
      )}
    </div>
  );
}
