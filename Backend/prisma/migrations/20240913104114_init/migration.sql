-- AlterTable
ALTER TABLE "parking_area" ADD COLUMN     "ulb_id" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "parking_incharge" ADD COLUMN     "ulb_id" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "ulb_id" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "scheduler" ADD COLUMN     "ulb_id" INTEGER NOT NULL DEFAULT 2;
