import type { Draw, Game } from "./game";

/**
 * Base Ticket — stored in the database
 */
export interface Ticket {
  id: string;
  userId: string;
  gameId: string;
  drawId: string;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
  createdAt: string;
}

/**
 * Ticket joined with Game and Draw (from Prisma include)
 */
export interface TicketWithRelations extends Ticket {
  game: Pick<Game, "name" | "logoUrl">;
  draw: Pick<
    Draw,
    | "drawNumber"
    | "drawDate"
    | "status"
    | "winningMainNumbers"
    | "winningSpecialNumbers"
  > | null;
}

/**
 * Enhanced Ticket returned by the API — includes the result logic
 *   - WON  → draw completed and all numbers matched
 *   - LOST → draw completed but not all matched
 *   - PENDING → draw upcoming
 */
export interface UserTicket extends TicketWithRelations {
  result: "WON" | "LOST" | "PENDING";
}
