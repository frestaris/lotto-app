export type SchedulerGame = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  iconName?: string | null;

  // Ticket rules
  priceCents: number;
  mainPickCount: number;
  mainRangeMin: number;
  mainRangeMax: number;
  specialPickCount: number;
  specialRangeMin?: number | null;
  specialRangeMax?: number | null;

  // Draw configuration
  drawFrequency?: string | null;
  jackpotCurrency?: string | null;
  isActive: boolean;

  // Jackpot settings
  currentJackpotCents?: number | null;
  baseJackpotCents?: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Prize divisions structure
  prizeDivisions?:
    | {
        matchMain: number;
        matchSpecial?: number;
        percentage?: number;
        fixed?: number;
        type: string;
      }[]
    | null;
};

export type SchedulerDraw = {
  id: string;
  gameId: string;
  drawNumber: number;
  drawDate: Date;
  jackpotCents: number | null;
  status: "UPCOMING" | "COMPLETED";
  winningMainNumbers: number[];
  winningSpecialNumbers: number[];
  totalSalesCents: number;
  winnersCount: number | null;
  createdAt: Date;
  updatedAt: Date;
};
