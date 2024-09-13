/*
  Warnings:

  - The `incharge_id` column on the `scheduler` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "scheduler" DROP COLUMN "incharge_id",
ADD COLUMN     "incharge_id" TEXT[];
