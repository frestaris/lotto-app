-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 200,
    "mainPickCount" INTEGER NOT NULL,
    "mainRangeMin" INTEGER NOT NULL DEFAULT 1,
    "mainRangeMax" INTEGER NOT NULL,
    "specialPickCount" INTEGER NOT NULL DEFAULT 0,
    "specialRangeMin" INTEGER,
    "specialRangeMax" INTEGER,
    "drawFrequency" TEXT,
    "jackpotCurrency" TEXT NOT NULL DEFAULT 'AUD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "drawNumber" INTEGER NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "winningMainNumbers" INTEGER[],
    "winningSpecialNumbers" INTEGER[],
    "jackpotAmountCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "numbers" INTEGER[],
    "specialNumbers" INTEGER[],
    "priceCents" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "payoutCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizeTier" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "matchMain" INTEGER NOT NULL,
    "matchSpecial" INTEGER NOT NULL,
    "payoutCents" INTEGER NOT NULL,

    CONSTRAINT "PrizeTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeTier" ADD CONSTRAINT "PrizeTier_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
