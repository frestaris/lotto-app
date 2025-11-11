export function getCronExpression(drawFrequency: string): string {
  const lower = drawFrequency.toLowerCase();

  if (lower.includes("5min") || lower.includes("5 min")) return "*/5 * * * *";

  if (lower.includes("daily")) return "0 20 * * 2"; // 8:00 PM every day
  if (lower.includes("tuesday")) return "0 20 * * 2"; // Tuesday 8 PM
  if (lower.includes("thursday")) return "0 20 * * 4"; // Thursday 8 PM
  if (lower.includes("saturday")) return "0 20 * * 6"; // Saturday 8 PM

  return "0 20 * * 2"; // default: daily 8 PM
}
