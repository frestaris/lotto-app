"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";
interface ToastData {
  message: string;
  type: ToastType;
}

let showToastGlobal: ((msg: string, type?: ToastType) => void) | null = null;

export function toast(msg: string, type: ToastType = "success") {
  if (showToastGlobal) showToastGlobal(msg, type);
}

export function GlobalToaster() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    showToastGlobal = (msg: string, type: ToastType = "success") => {
      setToast({ message: msg, type });
      setTimeout(() => setToast(null), 2500);
    };
    return () => {
      showToastGlobal = null;
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 transition-all
        ${
          toast.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }
      `}
      style={{
        animation: "popInOut 2.5s ease-in-out forwards",
        transformOrigin: "bottom right",
      }}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      {toast.message}

      <style jsx>{`
        @keyframes popInOut {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          10% {
            opacity: 1;
            transform: scale(1.05);
          }
          20% {
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
