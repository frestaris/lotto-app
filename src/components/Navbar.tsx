"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { User, ShoppingCart, Settings, Ticket, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.jpeg"
            alt="Lotto App"
            width={40}
            height={40}
            className="rounded"
            priority
          />
          <span className="text-2xl font-bold text-yellow-400">Lotto</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/cart" className="relative group">
            <ShoppingCart className="text-2xl text-white hover:text-yellow-400 transition" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 rounded-full group-hover:scale-105 transition">
              0
            </span>
          </Link>

          {!session ? (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:opacity-90 transition-all"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-2"
              >
                {session.user?.image ? (
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
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1e1e1e] rounded-xl border border-white/10 shadow-lg overflow-hidden">
                  <Link
                    href="/tickets"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-gray-200"
                    onClick={() => setOpen(false)}
                  >
                    <Ticket className="w-4 h-4 text-yellow-400" /> My Tickets
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-gray-200"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-4 h-4 text-yellow-400" /> Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-gray-200"
                    onClick={() => setOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-yellow-400" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-600 text-red-400 hover:text-white transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
