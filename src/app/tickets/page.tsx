"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading tickets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">
          My Tickets 🎟️
        </h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400">You haven’t played any games yet.</p>
        </div>
      </div>
    </div>
  );
}
