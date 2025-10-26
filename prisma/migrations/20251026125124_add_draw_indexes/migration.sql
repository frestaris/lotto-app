-- CreateIndex
CREATE INDEX "Draw_gameId_status_idx" ON "Draw"("gameId", "status");

-- CreateIndex
CREATE INDEX "Draw_gameId_drawDate_idx" ON "Draw"("gameId", "drawDate");
