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
        className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-black px-4 py-3 rounded-lg shadow-lg font-semibold"
        style={{
          animation: "popInOut 2.5s ease-in-out forwards",
          transformOrigin: "bottom right",
        }}
      >
        {message}

        {/* inline animation */}
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
    ) : null;

  return { showToast, Toast };
}
