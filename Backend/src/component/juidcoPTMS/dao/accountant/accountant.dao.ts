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
        ulb_id: ulb_id,
        is_verified: false
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
          // receipts: true,
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

  async getAccSummaryDetails(req: Request) {
    const { transaction_id } = req.params
    const { ulb_id } = req.body.auth
    const schedule: any = await prisma.scheduler.findFirst({
      where: {
        receipts: {
          some: {
            transaction_id: transaction_id,
            is_validated: true,
            is_paid: true
          }
        },
        ulb_id: ulb_id,
        accounts_summary: {
          some: {
            is_verified: false
          }
        }
      },
      include: {
        accounts_summary: {
          include: {
            area: true,
            incharge: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        },
        receipts: true
      }
    })

    if (!schedule) {
      throw new Error('No schedule found for this transaction')
    }

    const incharge: any[] = []

    await Promise.all(
      schedule?.incharge_id.map(async (item: any) => {
        const inchargeData = await prisma.parking_incharge.findFirst({
          where: {
            cunique_id: item
          }
        })
        incharge.push(inchargeData)
      })
    )

    schedule.incharge = incharge

    return generateRes(schedule);
  }

  async verify(transaction_id: string) {

    if (!transaction_id) {
      throw new Error(`Transaction ID is required as 'transaction_id'`)
    }

    const updatedData = await prisma.accounts_summary.update({
      where: {
        transaction_id: transaction_id
      },
      data: {
        is_verified: true
      }
    })

    return generateRes(updatedData);
  }

}

export default AccountantDao;
