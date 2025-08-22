/*
  Warnings:

  - You are about to drop the `BrowserInstance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BrowserInstance";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "browser_instance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "remark" TEXT,
    "pid" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'stopped',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
