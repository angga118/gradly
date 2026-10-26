-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photographerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "subsidyPrice" INTEGER,
    "subsidyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "kipkOnly" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Package_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("description", "features", "id", "isActive", "name", "photographerId", "popular", "price", "subsidyEnabled", "subsidyPrice") SELECT "description", "features", "id", "isActive", "name", "photographerId", "popular", "price", "subsidyEnabled", "subsidyPrice" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE INDEX "Package_photographerId_idx" ON "Package"("photographerId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "studio" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "acceptingBookings" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "subsidyValidUntil" TEXT,
    "subsidyDocType" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("acceptingBookings", "bio", "city", "createdAt", "email", "emailVerified", "id", "name", "passwordHash", "phone", "rating", "role", "sessions", "studio", "subsidyValidUntil", "tags") SELECT "acceptingBookings", "bio", "city", "createdAt", "email", "emailVerified", "id", "name", "passwordHash", "phone", "rating", "role", "sessions", "studio", "subsidyValidUntil", "tags" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
