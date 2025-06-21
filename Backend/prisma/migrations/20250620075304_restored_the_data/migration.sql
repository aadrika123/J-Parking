-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_scheduler_id_fkey";

-- AlterTable
ALTER TABLE "parking_incharge" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_scheduler_id_fkey" FOREIGN KEY ("scheduler_id") REFERENCES "scheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
