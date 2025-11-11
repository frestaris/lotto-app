"use client";

import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import TopupSuccessContent from "./TopupSuccessContent";

export default function TopupSuccessPage() {
  return (
    <Suspense
      fallback={
        <Spinner
          message="Processing payment..."
          variant="accent"
          size="lg"
          fullScreen
        />
      }
    >
      <TopupSuccessContent />
    </Suspense>
  );
}
