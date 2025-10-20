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
}
