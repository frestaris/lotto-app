export function getCronExpression(drawFrequency: string): string {
  const lower = drawFrequency.toLowerCase();

  if (lower.includes("daily")) return "0 21 * * *"; // 9:00 PM every day
  if (lower.includes("tuesday")) return "0 20 * * 2"; // Tuesday 8 PM
  if (lower.includes("thursday")) return "0 20 * * 4"; // Thursday 8 PM
  if (lower.includes("saturday")) return "0 20 * * 6"; // Saturday 8 PM

  return "0 21 * * *"; // default: daily 9 PM
}
