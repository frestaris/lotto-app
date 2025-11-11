"use client";

import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import TopupFailedContent from "./TopupFailedContent";

export default function TopupFailedPage() {
  return (
    <Suspense
      fallback={
        <Spinner
          message="Loading payment status..."
          variant="accent"
          size="lg"
          fullScreen
        />
      }
    >
      <TopupFailedContent />
    </Suspense>
  );
}
