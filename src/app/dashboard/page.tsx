"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { User } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400">
          Your Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User"
                  width={38}
                  height={38}
                  className="rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <User className="text-gray-300 w-5 h-5" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {session?.user?.name ||
                    session?.user?.email?.split("@")[0] ||
                    "Guest"}
                </h2>

                <p className="text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
            <p className="mt-4 text-gray-300">
              Welcome back! Here you’ll find your tickets and current balance.
            </p>
          </div>

          {/* Stats / Wallet */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg flex flex-col justify-center">
            <h3 className="text-lg text-gray-300 mb-2">Available Credits</h3>
            <p className="text-4xl font-bold text-yellow-400">
              ${((session?.user?.creditCents || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
