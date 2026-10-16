-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sizeKb" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedById" TEXT,
    "verifiedAt" DATETIME,
    CONSTRAINT "PaymentProof_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentProof_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PaymentProof" ("bookingId", "fileKey", "id", "name", "sizeKb", "uploadedAt", "verifiedAt", "verifiedById") SELECT "bookingId", "fileKey", "id", "name", "sizeKb", "uploadedAt", "verifiedAt", "verifiedById" FROM "PaymentProof";
DROP TABLE "PaymentProof";
ALTER TABLE "new_PaymentProof" RENAME TO "PaymentProof";
CREATE UNIQUE INDEX "PaymentProof_bookingId_key" ON "PaymentProof"("bookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HighlightCard_photographerId_idx" ON "HighlightCard"("photographerId");

-- CreateIndex
CREATE INDEX "LedgerEntry_bookingId_idx" ON "LedgerEntry"("bookingId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Package_photographerId_idx" ON "Package"("photographerId");

-- CreateIndex
CREATE INDEX "PortfolioItem_photographerId_idx" ON "PortfolioItem"("photographerId");

-- CreateIndex
CREATE INDEX "SubsidyApplication_userId_idx" ON "SubsidyApplication"("userId");

-- CreateIndex
CREATE INDEX "SubsidyApplication_status_idx" ON "SubsidyApplication"("status");

-- CreateIndex
CREATE INDEX "Testimonial_photographerId_idx" ON "Testimonial"("photographerId");

-- CreateIndex
CREATE INDEX "Withdrawal_photographerId_idx" ON "Withdrawal"("photographerId");
