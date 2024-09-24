-- AlterTable
ALTER TABLE "accounts_summary" ADD COLUMN     "scheduler_id" INTEGER;

-- AddForeignKey
ALTER TABLE "accounts_summary" ADD CONSTRAINT "accounts_summary_scheduler_id_fkey" FOREIGN KEY ("scheduler_id") REFERENCES "scheduler"("id") ON DELETE SET NULL ON UPDATE CASCADE;
