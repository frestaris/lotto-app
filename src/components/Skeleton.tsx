"use client";

export default function Skeleton({
  height = "h-10",
  width = "w-full",
  className = "",
}: {
  height?: string;
  width?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/10 rounded-lg animate-pulse ${height} ${width} ${className}`}
    />
  );
}
