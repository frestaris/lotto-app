"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, KeyRound, Trash2 } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [openModal, setOpenModal] = useState<
    null | "email" | "password" | "delete" | "credits"
  >(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Skeleton
  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-5xl w-full space-y-10 animate-pulse">
          {/* Header Skeleton */}
          <div className="text-center space-y-2">
            <Skeleton height="h-8" width="w-48" className="mx-auto" />
            <Skeleton height="h-4" width="w-64" className="mx-auto" />
          </div>

          {/* KPI Grid Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl w-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0a0a0a] p-6 flex flex-col items-center justify-center space-y-3"
              >
                <Skeleton height="h-6" width="w-6" className="rounded-full" />
                <Skeleton height="h-4" width="w-20" />
                <Skeleton height="h-5" width="w-32" />
                <Skeleton height="h-4" width="w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full space-y-10 px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-3 tracking-tight">
            Account Settings
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your profile and security preferences.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6  max-w-6xl w-full z-10 cursor-pointer">
          {/* Email */}
          <GameCard onClick={() => setOpenModal("email")}>
            <Mail className="w-6 h-6 text-yellow-400 mb-2" />
            <h3 className="text-sm text-gray-400">Email</h3>
            <p className="text-base text-white font-medium truncate">
              {session?.user?.email}
            </p>
            <span className="text-yellow-400 font-semibold text-sm mt-2">
              Edit Email
            </span>
          </GameCard>
          {/* Password */}
          <GameCard onClick={() => setOpenModal("password")}>
            <KeyRound className="w-6 h-6 text-yellow-400 mb-2" />
            <h3 className="text-sm text-gray-400">Password</h3>
            <p className="text-base text-white font-medium">••••••••</p>
            <span className="text-yellow-400 font-semibold text-sm mt-2">
              Change Password
            </span>
          </GameCard>
          {/* Credits */}
          <GameCard onClick={() => setOpenModal("credits")}>
            <span className="text-3xl font-extrabold text-yellow-400 block mb-2">
              ${((session?.user?.creditCents || 0) / 100).toFixed(2)}
            </span>{" "}
            <h3 className="text-sm text-gray-400">Available Credits</h3>
            <span className="text-yellow-400 font-semibold text-sm mt-2">
              Add Credits
            </span>
          </GameCard>
          {/* Delete */}
          <GameCard onClick={() => setOpenModal("delete")}>
            <Trash2 className="w-6 h-6 text-red-400 mb-2" />
            <h3 className="text-sm text-gray-400">Account</h3>
            <span className="text-red-400 font-semibold text-sm mt-2">
              Delete Account
            </span>
          </GameCard>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={openModal === "email"}
        onClose={() => setOpenModal(null)}
        title="Edit Email"
      >
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter new email"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
          >
            Save Changes
          </button>
        </form>
      </Modal>

      {/* 🔑 Change Password Modal */}
      <Modal
        isOpen={openModal === "password"}
        onClose={() => setOpenModal(null)}
        title="Change Password"
      >
        <form className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
          >
            Update Password
          </button>
        </form>
      </Modal>

      {/* 🗑️ Delete Account Modal */}
      <Modal
        isOpen={openModal === "delete"}
        onClose={() => setOpenModal(null)}
        title="Delete Account"
      >
        <p className="text-gray-300 text-sm mb-4">
          This action cannot be undone. Type <strong>DELETE</strong> to confirm.
        </p>
        <input
          type="text"
          placeholder="Type DELETE"
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-red-400 outline-none mb-4"
        />
        <button className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition">
          Permanently Delete
        </button>
      </Modal>

      {/* 💰 Add Credits Modal */}
      <Modal
        isOpen={openModal === "credits"}
        onClose={() => setOpenModal(null)}
        title="Add Credits"
      >
        <p className="text-gray-300 text-sm mb-4">
          Enter the amount of credits you’d like to add.
        </p>
        <input
          type="number"
          placeholder="Amount"
          min={1}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none mb-4"
        />
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition">
          Add Credits
        </button>
      </Modal>
    </div>
  );
}
