-- CreateEnum
CREATE TYPE "DrawStatus" AS ENUM ('UPCOMING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Draw" ADD COLUMN     "status" "DrawStatus" NOT NULL DEFAULT 'UPCOMING';
