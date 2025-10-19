"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react"; // Lucide spinner icon
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // when pathname changes → show spinner briefly
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // adjust timing if needed
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );
}
