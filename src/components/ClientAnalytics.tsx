"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClientAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
