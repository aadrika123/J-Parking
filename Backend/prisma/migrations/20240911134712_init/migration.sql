/*
  Warnings:

  - The `extended_hours` column on the `scheduler` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "scheduler" DROP COLUMN "extended_hours",
ADD COLUMN     "extended_hours" JSONB;
