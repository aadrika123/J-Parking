/*
  Warnings:

  - You are about to drop the column `isScheduled` on the `scheduler` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scheduler" DROP COLUMN "isScheduled",
ADD COLUMN     "is_scheduled" BOOLEAN NOT NULL DEFAULT true;
