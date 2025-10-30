"use client";

import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:cursor-pointer hover:text-yellow-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-yellow-400 mb-4">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}
