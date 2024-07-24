import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { generateRes } from "../../../../util/generateRes";

const prisma = new PrismaClient();

class InchargeReportDao {
  static async report(req: Request) {
    const { incharge_id, date, month, year } = req.body;

    function qr_func(monthlyWise: boolean, condition?: string) {
      return `

      ${
        !monthlyWise
          ? `
        		  SELECT 
                SUM(CASE WHEN receipts.vehicle_type = 'two_wheeler' THEN amount ELSE 0 END)::INT AS total_two_wheeler_collection,
                SUM(CASE WHEN receipts.vehicle_type = 'four_wheeler' THEN amount ELSE 0 END)::INT AS total_four_wheeler_collection,
                SUM(amount)::INT as total_amount,
                date,
                receipts.incharge_id
              FROM receipts
              LEFT JOIN parking_area AS bm ON receipts.area_id = bm.id
              LEFT JOIN parking_incharge AS cm ON receipts.incharge_id = cm.cunique_id
              GROUP BY date, receipts.incharge_id
              HAVING receipts.incharge_id = '${incharge_id}'
          ${condition || ""}
      `
          : ` 
        SELECT 
          SUM(CASE WHEN receipts.vehicle_type = 'two_wheeler' THEN amount ELSE 0 END)::INT AS total_two_wheeler_collection,
          SUM(CASE WHEN receipts.vehicle_type = 'four_wheeler' THEN amount ELSE 0 END)::INT AS total_four_wheeler_collection,
          SUM(amount)::INT as total_amount,
          extract(month from date) as month,
          extract(year from date) as year,
          receipts.incharge_id
        FROM receipts 
        LEFT JOIN parking_area AS bm ON receipts.area_id = bm.id
        LEFT JOIN parking_incharge AS cm ON receipts.incharge_id = cm.cunique_id
        GROUP BY extract(month from date), extract(year from date), receipts.incharge_id
        having receipts.incharge_id = '${incharge_id}' and extract(month from date) = '${month}' and extract(year from date) = '${year}'
      `
      }
      `;
    }

    let qr = qr_func(false);

    if (date) {
      qr = qr_func(false, `AND date = '${date}'`);
    }

    if (month && year) {
      qr = qr_func(true);
    }
1
    const [data] = await prisma.$transaction([
      prisma.$queryRawUnsafe<any[]>(`${qr}`),
    ]);

    return generateRes(data);
  }
}

export default InchargeReportDao;
