/**
 * Checks if the draw time defined in `frequency` (e.g., "Saturday 8 PM")
 * has already passed for the given draw date (local time).
 */

export type DrawFrequency =
  | "Daily 8 PM"
  | "Thursday 8 PM"
  | "Saturday 8 PM"
  | "Tuesday 8 PM"
  | string;

export function hasDrawTimePassed(
  drawDate: Date,
  frequency: DrawFrequency | null
): boolean {
  const now = new Date();

  if (!frequency) return drawDate < now;

  const parts = frequency.split(" ");
  const timePart = parts.pop() ?? "";
  const [time, ampm] = timePart.split(" ");
  let [hour, minute] = time.split(":").map(Number);
  minute = minute || 0;

  // 🔹 Default to 8 PM if parsing fails
  if (isNaN(hour)) hour = 8;
  if (ampm?.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (ampm?.toUpperCase() === "AM" && hour === 12) hour = 0;

  const drawDateTime = new Date(drawDate);
  drawDateTime.setHours(hour, minute, 0, 0);

  return now >= drawDateTime;
}
