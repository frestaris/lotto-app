export function getNextDrawDates(frequency: string, count = 6): Date[] {
  const now = new Date();
  const draws: Date[] = [];
  const [dayOfWeek, timeStr] = frequency.split(" ");
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

  let next = new Date(now);
  next.setHours(hour24, 0, 0, 0);

  // advance to the next target day/time
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
