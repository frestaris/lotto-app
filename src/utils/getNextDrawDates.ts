/**
 * Generates the next N draw dates for a game based on its frequency string.
 */
export function getNextDrawDates(frequency: string | null, count = 6): Date[] {
  if (!frequency) return [];

  const now = new Date();
  const draws: Date[] = [];
  const lower = frequency.toLowerCase().trim();

  const hour = 20; // 🔹 Force all draws to 8 PM

  // 🗓️ DAILY DRAW HANDLING
  if (lower.startsWith("daily")) {
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    for (let i = 0; i < count; i++) {
      draws.push(new Date(next));
      next.setDate(next.getDate() + 1);
    }

    return draws;
  }

  // 🗓️ WEEKLY DRAW HANDLING (e.g. "Thursday 8 PM")
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const dayMatch = days.find((d) => lower.includes(d));
  if (!dayMatch) return [];

  const targetDayIndex = days.indexOf(dayMatch);
  const currentDayIndex = now.getDay();

  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);

  // If draw is today but time already passed, skip to next week
  if (currentDayIndex === targetDayIndex && next <= now) {
    next.setDate(next.getDate() + 7);
  } else if (currentDayIndex !== targetDayIndex) {
    const diff = (targetDayIndex + 7 - currentDayIndex) % 7;
    next.setDate(now.getDate() + (diff || 7));
    next.setHours(hour, 0, 0, 0);
  }

  // Generate next N weekly draws
  for (let i = 0; i < count; i++) {
    draws.push(new Date(next));
    next.setDate(next.getDate() + 7);
  }

  return draws;
}
