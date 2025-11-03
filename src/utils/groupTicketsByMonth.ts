import type { UserTicket } from "@/types/ticket";

export function groupTicketsByMonth(
  tickets: UserTicket[]
): Record<string, UserTicket[]> {
  const groups: Record<string, UserTicket[]> = {};
  for (const t of tickets) {
    const drawDate = t.draw?.drawDate
      ? new Date(t.draw.drawDate)
      : new Date(t.createdAt);
    const key = drawDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

export function convertToYearMonth(label: string) {
  const [mon, year] = label.split(" ");
  const monthIndex = new Date(`${mon} 1, ${year}`).getMonth() + 1;
  return `${year}-${monthIndex.toString().padStart(2, "0")}`;
}
