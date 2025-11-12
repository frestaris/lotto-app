/**
 * Calculates the next draw date for a given game frequency.
 * Ensures all draws happen at 8 PM Brisbane time (AEST = UTC+10).
 */
export function getNextDrawDate(drawFrequency: string, fromDate: Date): Date {
  const lower = drawFrequency.toLowerCase();

  const next = new Date(fromDate);
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // 🔹 Daily draws — 8 PM Brisbane = 10:00 UTC
  if (lower.includes("daily")) {
    // Set UTC hour directly corresponding to 8 PM Brisbane
    next.setUTCHours(10, 0, 0, 0); // 8 PM AEST = 10 AM UTC
    if (next <= fromDate) next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  // 🔹 Weekly draws (Thursday, Saturday, etc.)
  const match =
    Object.keys(dayMap).find((d) => lower.includes(d)) || "saturday";
  const targetDay = dayMap[match];
  const currentDay = next.getUTCDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;

  next.setUTCDate(next.getUTCDate() + daysUntil);
  next.setUTCHours(10, 0, 0, 0);
  return next;
}
