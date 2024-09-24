-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "scheduler_id" INTEGER;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_scheduler_id_fkey" FOREIGN KEY ("scheduler_id") REFERENCES "scheduler"("id") ON DELETE SET NULL ON UPDATE CASCADE;
