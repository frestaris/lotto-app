"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Skeleton from "@/components/Skeleton";
import EditEmailCard from "./components/EditEmailCard";
import ChangePasswordCard from "./components/ChangePasswordCard";
import AddCreditsCard from "./components/AddCreditsCard";
import DeleteAccountCard from "./components/DeleteAccountCard";
import { useAppSelector } from "@/redux/store";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { updatedBalance } = useAppSelector((state) => state.tickets);
  const account = useAppSelector((state) => state.account?.account);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-5xl w-full space-y-10">
          {/* Header skeletons */}
          <div className="text-center space-y-3">
            <Skeleton height="h-8" width="w-48" className="mx-auto" />
            <Skeleton height="h-4" width="w-64" className="mx-auto" />
          </div>

          {/* GameCard-style skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0a0a0a] h-[220px] p-6 flex flex-col items-center text-center justify-between hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:border-yellow-400/10 transition-all duration-300"
              >
                {/* Icon circle */}
                <Skeleton height="h-8" width="w-8" className="rounded-full" />

                {/* Big number / title bar */}
                <Skeleton height="h-6" width="w-24" className="rounded-md" />

                {/* Subtext */}
                <Skeleton height="h-4" width="w-20" className="rounded-md" />

                {/* CTA stripe (yellow-ish hint) */}
                <Skeleton
                  height="h-4"
                  width="w-28"
                  className="rounded-md bg-yellow-400/20"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const credits =
    updatedBalance ?? account?.creditCents ?? session?.user?.creditCents ?? 0;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white flex flex-col items-center justify-center pt-10 sm:pt-0">
      <div className="max-w-5xl w-full space-y-10 px-4 sm:px-6 lg:px-0">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-3 tracking-tight">
            Account Settings
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your profile and security preferences.
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl w-full z-10">
          <EditEmailCard />
          <ChangePasswordCard />
          <AddCreditsCard credits={credits} />
          <DeleteAccountCard />
        </div>
      </div>
    </div>
  );
}
