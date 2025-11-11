/**
 * ---------------------------------------
 * Calculates the next draw date for a given game frequency.
 * Supports:
 *  - "Daily 8 PM"
 *  - "Thursday 8 PM", "Saturday 8 PM", etc.
 */
export function getNextDrawDate(drawFrequency: string, fromDate: Date): Date {
  const next = new Date(fromDate);
  const lower = drawFrequency.toLowerCase();

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // 🔹 Daily draws to 8 PM
  if (lower.includes("daily")) {
    const hour = 20;
    next.setHours(hour, 0, 0, 0);
    if (next <= fromDate) next.setDate(next.getDate() + 1);
    return next;
  }

  // Weekly draws (Thursday, Saturday, etc.)
  const match =
    Object.keys(dayMap).find((d) => lower.includes(d)) || "saturday";
  const targetDay = dayMap[match];
  const currentDay = fromDate.getDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;

  next.setDate(fromDate.getDate() + daysUntil);
  next.setHours(20, 0, 0, 0);
  return next;
}
