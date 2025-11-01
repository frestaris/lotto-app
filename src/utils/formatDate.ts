export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const year = d.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}
