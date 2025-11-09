/**
 * 🚀 Scheduler Entry Point
 */
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { scheduleAllGames } from "./scheduleAllGames";
dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

async function main() {
  console.log("🟢 Starting Lotto Draw Scheduler...");
  await scheduleAllGames(prisma);
  console.log("🚀 Draw scheduler running...");
}

main()
  .catch((err: unknown) => console.error("❌ Scheduler init failed:", err))
  .finally(async () => {
    await prisma.$disconnect();
  });

// Graceful shutdown (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("\n🧹 Shutting down scheduler...");
  await prisma.$disconnect();
  process.exit(0);
});
