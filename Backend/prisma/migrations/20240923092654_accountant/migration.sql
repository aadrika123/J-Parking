-- AddForeignKey
ALTER TABLE "accounts_summary" ADD CONSTRAINT "accounts_summary_incharge_id_fkey" FOREIGN KEY ("incharge_id") REFERENCES "parking_incharge"("cunique_id") ON DELETE RESTRICT ON UPDATE CASCADE;
