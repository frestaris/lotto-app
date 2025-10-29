"use client";

import React, { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-2 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-center text-gray-300 mb-8 text-sm">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
