/*
  Warnings:

  - You are about to drop the column `four_wheeler_amount` on the `parking_area` table. All the data in the column will be lost.
  - You are about to drop the column `two_wheeler_amount` on the `parking_area` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parking_area" DROP COLUMN "four_wheeler_amount",
DROP COLUMN "two_wheeler_amount";
