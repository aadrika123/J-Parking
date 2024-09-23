/*
  Warnings:

  - You are about to drop the column `is_validated` on the `receipts` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "receipts_incharge_id_date_key";

-- AlterTable
ALTER TABLE "receipts" DROP COLUMN "is_validated";
