-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "transaction_id" TEXT;

-- CreateTable
CREATE TABLE "accounts_summary" (
    "incharge_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "area_id" INTEGER NOT NULL,
    "status" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_summary_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_summary_transaction_id_key" ON "accounts_summary"("transaction_id");

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "accounts_summary"("transaction_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_summary" ADD CONSTRAINT "accounts_summary_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "parking_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
