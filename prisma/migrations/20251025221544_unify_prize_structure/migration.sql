/*
  Warnings:

  - You are about to drop the `PrizeTier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PrizeTier" DROP CONSTRAINT "PrizeTier_gameId_fkey";

-- AlterTable
ALTER TABLE "Draw" ADD COLUMN     "divisionResults" JSONB;

-- DropTable
DROP TABLE "public"."PrizeTier";
