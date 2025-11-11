"use client";

import Link from "next/link";
import { Home, Frown } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] text-center text-gray-200 bg-[#0a0a0a] px-6">
      <Frown className="w-16 h-16 text-yellow-400 mb-6 animate-bounce" />

      <h1 className="text-4xl font-extrabold mb-2">404</h1>
      <p className="text-lg text-gray-400 mb-8">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
        >
          <Home className="w-5 h-5" />
          Home
        </Link>
      </div>

      <p className="mt-10 text-sm text-gray-500">
        If you believe this is an error, please contact support.
      </p>
    </div>
  );
}
