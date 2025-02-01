/**
 * Author: Anil Tigga
 * status: Open
 */

import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class AccountantDao {
  async getAccSummaryList(req: Request) {
    const limit: number = Number(req.query.limit);
    const page: number = Number(req.query.page);
    const offset = (page - 1) * limit;
    const {ulb_id} = req.body.auth || 2;

    // Ensure query params are strings
    const start = req.query.start as string | undefined;
    const end = req.query.end as string | undefined;
    const incharge = req.query.incharge as string | undefined;

    try {
        const whereClause: any = {
            ulb_id: ulb_id,
            is_verified: false
        };

        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999); // Ensure full-day filtering

            whereClause.created_at = {
                gte: startDate.toISOString(),
                lte: endDate.toISOString(),
            };
        }

        if (incharge) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                { incharge_id: incharge }
            ];
        }

        console.log("whereClause:", JSON.stringify(whereClause, null, 2)); // Debugging

        const countResult = await prisma.accounts_summary.count({ where: whereClause });
        const totalItems = Number(countResult);
        const totalPages = Math.ceil(totalItems / limit);

        const dataResult = await prisma.accounts_summary.findMany({
            orderBy: { updated_at: 'desc' },
            where: whereClause,
            ...(page && { skip: offset }),
            ...(limit && { take: limit }),
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
        console.error("Error fetching account summary data: ", error);
        return { error: "Internal Server Error" };
    }
}


  async getAccSummaryDetails(req: Request) {
    const { transaction_id } = req.params
    console.log(transaction_id,"trannnnnnnnnnnn")
    const {ulb_id}  = req.body.auth || 2
    const schedule: any = await prisma.scheduler.findFirst({
      // where: {
        // receipts: {
        //   some: {
        //     transaction_id: transaction_id,
        //     is_validated: true,
        //     is_paid: true
        //   }
        // },
        where: {
          receipts: {
            some: {
              transaction_id: transaction_id
            }
          },
        // ulb_id: ulb_id,
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

  async getSchedules(date: Date = new Date()) {

    const data = await prisma.scheduler.findMany({
      where: {
        AND: [
          {
            from_date: {
              lte: date
            }
          },
          {
            to_date: {
              gte: date
            }
          }
        ]
      }
    })

    if (data.length !== 0) {
      await Promise.all(
        data.map(async (item: any) => {
          const locationData = await prisma.parking_area.findFirst({
            where: {
              id: item?.location_id as number
            },
            select: {
              id: true,
              address: true,
              station: true,
              zip_code: true
            }
          })
          item.location = locationData
        })
      )
    }

    return generateRes(data);
  }

}

export default AccountantDao;
