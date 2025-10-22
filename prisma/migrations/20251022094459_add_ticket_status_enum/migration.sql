/*
  Warnings:

  - You are about to drop the column `isWinner` on the `Ticket` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'WON', 'LOST');

-- DropForeignKey
ALTER TABLE "public"."Ticket" DROP CONSTRAINT "Ticket_drawId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "isWinner",
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "drawId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Ticket_gameId_status_idx" ON "Ticket"("gameId", "status");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE SET NULL ON UPDATE CASCADE;
