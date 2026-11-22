-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ChatMessage_customerId_photographerId_createdAt_idx" ON "ChatMessage"("customerId", "photographerId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_photographerId_createdAt_idx" ON "ChatMessage"("photographerId", "createdAt");
