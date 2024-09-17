/*
  Warnings:

  - You are about to drop the column `isPaid` on the `receipts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "receipts" DROP COLUMN "isPaid",
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false;
