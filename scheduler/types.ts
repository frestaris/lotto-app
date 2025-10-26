export type SchedulerGame = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
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
  createdAt: Date;
  updatedAt: Date;
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
};

export type SchedulerDraw = {
  id: string;
  gameId: string;
  drawNumber: number;
  drawDate: Date; // ✅ Prisma returns Date, not string
  jackpotCents: number | null;
  status: "UPCOMING" | "COMPLETED";
  winningMainNumbers: number[];
  winningSpecialNumbers: number[];
  createdAt: Date;
  updatedAt: Date;
  totalSalesCents: number;
  winnersCount: number | null;
};
