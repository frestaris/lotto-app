-- AlterTable
ALTER TABLE "Draw" ADD COLUMN     "jackpotCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSalesCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winnersCount" INTEGER;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "baseJackpotCents" INTEGER NOT NULL DEFAULT 500000000,
ADD COLUMN     "jackpotGrowthPct" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
ADD COLUMN     "prizeDivisions" JSONB;

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "payoutCents" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creditCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
