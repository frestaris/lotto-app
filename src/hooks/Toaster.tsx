"use client";
import React, { useState } from "react";

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string, duration = 2500) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  };

  const Toast: React.FC = () =>
    message ? (
      <div
        role="alert"
        className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-black px-4 py-3 rounded-lg shadow-lg font-semibold animate-fade-in"
      >
        {message}
      </div>
    ) : null;

  return { showToast, Toast };
}
