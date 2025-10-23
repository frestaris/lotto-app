export function getNextDrawDates(frequency: string, count = 6): Date[] {
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

  const [hour, meridiem] = timeStr.split(/(?=[AP]M)/);
  const hour24 =
    parseInt(hour) + (meridiem === "PM" && parseInt(hour) < 12 ? 12 : 0);

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

  if (targetDayIndex === -1) return []; // prevent infinite loop

  let next = new Date(now);
  next.setHours(hour24, 0, 0, 0);

  while (next.getDay() !== targetDayIndex || next <= now) {
    next.setDate(next.getDate() + 1);
  }

  for (let i = 0; i < count; i++) {
    draws.push(new Date(next));
    next = new Date(next);
    next.setDate(next.getDate() + 7); // weekly cycle
  }

  return draws;
}
