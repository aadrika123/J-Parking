/*
  Warnings:

  - A unique constraint covering the columns `[incharge_id,date]` on the table `receipts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "receipts_incharge_id_date_key" ON "receipts"("incharge_id", "date");
