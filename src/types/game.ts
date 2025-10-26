export interface Game {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  priceCents: number;
  mainPickCount: number;
  mainRangeMin: number;
  mainRangeMax: number;
  specialPickCount: number;
  specialRangeMin?: number | null;
  specialRangeMax?: number | null;
  drawFrequency?: string | null;
  jackpotCurrency?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  currentJackpotCents?: number | null;
  baseJackpotCents?: number | null;
  prizeDivisions?:
    | {
        matchMain: number;
        matchSpecial?: number;
        percentage?: number;
        fixed?: number;
        type: string;
      }[]
    | null;
}

/**
 * ✅ Division result for each completed draw
 */
export interface DivisionResult {
  type: string;
  poolCents: number;
  winnersCount: number;
  eachCents: number;
}

/**
 * ✅ Updated Draw interface — now includes divisionResults
 */
export interface Draw {
  id: string;
  gameId: string;
  drawNumber: number;
  drawDate: string;
  jackpotCents: number | null;
  status: "UPCOMING" | "COMPLETED";
  winningMainNumbers: number[];
  winningSpecialNumbers: number[];
  createdAt: string;
  updatedAt: string;

  // 🏆 new backend field
  divisionResults?: DivisionResult[] | null;
}

export type DisplayStatus =
  | "UPCOMING"
  | "COMPLETED"
  | "TODAY"
  | "AWAITING_RESULTS";

export interface LatestDraw {
  gameId: string;
  gameName: string;
  logoUrl: string | null;
  drawNumber: number;
  drawDate: string;
  jackpotCents?: number | null;
  winningMainNumbers: number[];
  winningSpecialNumbers: number[];
  dbStatus: "UPCOMING" | "COMPLETED";
  displayStatus: DisplayStatus;
}
