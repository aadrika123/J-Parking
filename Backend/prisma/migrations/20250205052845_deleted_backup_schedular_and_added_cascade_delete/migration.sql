/*
  Warnings:

  - You are about to drop the `backup_scheduler` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_scheduler_id_fkey";

-- DropTable
DROP TABLE "backup_scheduler";

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_scheduler_id_fkey" FOREIGN KEY ("scheduler_id") REFERENCES "scheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
