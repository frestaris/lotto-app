export function getNextDrawDates(frequency: string | null, count = 6): Date[] {
  if (!frequency) return []; // ✅ guard against null or undefined

  const now = new Date();
  const draws: Date[] = [];
  const lower = frequency.toLowerCase();

  // Handle daily draws, e.g. "Daily 9 PM"
  if (lower.includes("daily")) {
    const timeMatch = lower.match(/(\d+)\s*(am|pm)/);
    const hour =
      timeMatch && timeMatch[2] === "pm"
        ? parseInt(timeMatch[1]) + 12
        : parseInt(timeMatch?.[1] ?? "20");

    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    for (let i = 0; i < count; i++) {
      draws.push(new Date(next));
      next.setDate(next.getDate() + 1); // next day
    }

    return draws;
  }

  // Handle weekly draws (e.g. "Thursday 8 PM")
  const [dayOfWeek, timeStr] = frequency.split(" ");
  if (!dayOfWeek || !timeStr) return []; // guard against malformed strings

  // Extract hour and AM/PM
  const timeMatch = timeStr.match(/(\d+)\s*(am|pm)/i);
  const hour =
    timeMatch && timeMatch[2].toLowerCase() === "pm"
      ? parseInt(timeMatch[1]) + 12
      : parseInt(timeMatch?.[1] ?? "20");

  // Map day names
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const targetDayIndex = days.findIndex((d) =>
    d.toLowerCase().includes(dayOfWeek.toLowerCase())
  );
  if (targetDayIndex === -1) return [];

  let next = new Date(now);
  next.setHours(hour, 0, 0, 0);

  // ✅ Include today’s draw if it hasn’t passed yet
  const currentDay = now.getDay();

  if (currentDay === targetDayIndex) {
    if (next <= now) {
      // today’s draw time already passed → next week
      next.setDate(next.getDate() + 7);
    }
  } else {
    // find the next occurrence of the target day
    const diff = (targetDayIndex + 7 - currentDay) % 7 || 7; // ensures non-zero positive diff
    next.setDate(now.getDate() + diff);
    next.setHours(hour, 0, 0, 0);
  }

  // generate next N weekly draws
  for (let i = 0; i < count; i++) {
    draws.push(new Date(next));
    next = new Date(next);
    next.setDate(next.getDate() + 7);
  }

  return draws;
}
