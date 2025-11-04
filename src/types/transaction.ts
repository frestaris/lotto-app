import type { Game } from "./game";

/**
 * Base transaction as stored in the database (WalletTransaction model)
 */
export interface Transaction {
  id: string;
  userId: string;
  gameId?: string | null;
  type: "TICKET_PURCHASE" | "PAYOUT" | "DEBIT" | "CREDIT" | string;
  amountCents: number;
  reference?: string | null;
  description?: string | null;
  createdAt: string;
}

/**
 * Extended transaction returned by the API
 * (includes related Game info and optional derived fields)
 */
export interface UserTransaction extends Transaction {
  game?: Pick<Game, "id" | "name" | "slug" | "iconName"> | null;
  draw?: { drawNumber: number; drawDate: string } | null;
  formattedAmount?: string;
  isCredit?: boolean;
}

/**
 * The full API response structure
 */
export interface TransactionsResponse {
  transactions: UserTransaction[];
}
