/**
 * Author: Anil Tigga
 * status: Open
 */

import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

class AccountantDao {
  async getAccSummaryList(req: Request) {

    const limit: number = Number(req.query.limit) || 10;
    const page: number = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const { ulb_id } = req.body.auth


    try {

      const whereClause: Prisma.accounts_summaryWhereInput = {
        ulb_id: ulb_id
      }

      const countResult = await prisma.accounts_summary.count({ where: whereClause })
      const totalItems = Number(countResult);
      const totalPages = Math.ceil(totalItems / limit);

      const dataResult = await prisma.accounts_summary.findMany({
        orderBy: {
          updated_at: 'desc'
        },
        where: whereClause,
        skip: offset,
        take: limit,
        select: {
          transaction_id: true,
          incharge: {
            select: {
              cunique_id: true,
              first_name: true,
              middle_name: true,
              last_name: true
            }
          },
          area: {
            select: {
              id: true,
              address: true,
            }
          },
          description: true,
          receipts: true,
          date: true,
          total_amount: true,
          status: true
        }
      });


      return generateRes({
        page,
        totalItems,
        totalPages,
        data: dataResult,
      });
    } catch (error) {
      console.error("Error fetching schedule incharge data: ", error);
      return { error: "Internal Server Error" };
    }


  }

}

export default AccountantDao;
