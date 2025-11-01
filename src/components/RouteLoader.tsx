"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Spinner from "./Spinner";

export default function RouteLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    setLoading(true);

    const timeout = setTimeout(() => setLoading(false), 400);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[9999]">
      <Spinner variant="accent" size="lg" />
    </div>
  );
}
