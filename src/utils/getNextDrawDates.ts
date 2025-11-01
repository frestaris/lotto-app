export function getNextDrawDates(frequency: string | null, count = 6): Date[] {
  if (!frequency) return [];

  const now = new Date();
  const draws: Date[] = [];
  const lower = frequency.toLowerCase().trim();

  // 🕐 Extract time info (like "8 PM" or "9 am")
  const timeMatch = lower.match(/(\d+)\s*(am|pm)/);
  const hour = timeMatch
    ? timeMatch[2] === "pm"
      ? parseInt(timeMatch[1]) + 12
      : parseInt(timeMatch[1])
    : 20; // fallback 8 PM

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

  // if draw is today but already passed, skip a week
  if (currentDayIndex === targetDayIndex && next <= now) {
    next.setDate(next.getDate() + 7);
  } else if (currentDayIndex !== targetDayIndex) {
    const diff = (targetDayIndex + 7 - currentDayIndex) % 7;
    next.setDate(now.getDate() + (diff || 7));
    next.setHours(hour, 0, 0, 0);
  }

  // generate next N weekly draws
  for (let i = 0; i < count; i++) {
    draws.push(new Date(next));
    next.setDate(next.getDate() + 7);
  }

  return draws;
}
