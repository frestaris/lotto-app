"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Skeleton from "@/components/Skeleton";
import EditEmailCard from "./components/EditEmailCard";
import ChangePasswordCard from "./components/ChangePasswordCard";
import AddCreditsCard from "./components/AddCreditsCard";
import DeleteAccountCard from "./components/DeleteAccountCard";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-5xl w-full space-y-10 animate-pulse">
          <div className="text-center space-y-2">
            <Skeleton height="h-8" width="w-48" className="mx-auto" />
            <Skeleton height="h-4" width="w-64" className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white flex flex-col items-center justify-center">
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
          <AddCreditsCard credits={session?.user?.creditCents || 0} />
          <DeleteAccountCard />
        </div>
      </div>
    </div>
  );
}
