import type { UserTicket } from "@/types/ticket";

export function groupTicketsByMonth(
  tickets: UserTicket[]
): Record<string, UserTicket[]> {
  const groups: Record<string, UserTicket[]> = {};
  for (const t of tickets) {
    const date = new Date(t.createdAt);
    const key = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}
