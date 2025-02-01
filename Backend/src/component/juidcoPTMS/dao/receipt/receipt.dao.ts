import { Request } from "express";
import { Prisma, PrismaClient, type_parking_space, vehicle_type } from "@prisma/client";
import { generateRes } from "../../../../util/generateRes";
import generateUniqueId, { generateReceiptNumberV2 } from "../../../../util/helper/generateUniqueNo";
import { timeDifferenceInHours } from "../../../../util/helper";

const prisma = new PrismaClient();

export const genrateDate = () => { };
class ReceiptDao {


  static getAreaAmount = async (req: Request) => {
    const { area_id } = req.query;
    const data = await prisma.parking_area.findUnique({
      where: {
        id: Number(area_id),
      },
      select: {
        two_wheeler_rate: true,
        four_wheeler_rate: true,
      },
    });

    return generateRes(data);
  };

  static post = async (req: Request) => {
    const { in_time, out_time } = req.body;
    const type_parking_space: number = Number(req.body.type_parking_space);
    const vehicle_type: number = req.body.vehicle_type;
    const ulb_id = req?.body?.auth?.ulb_id || 2

    const date = new Date();

    const receipt_no = generateUniqueId("T0050");

    const getAreaAmount = await prisma.parking_area.findUnique({
      where: {
        id: Number(req.body.area_id),
      },
      select: {
        two_wheeler_rate: true,
        four_wheeler_rate: true,
      },
    });

    const two_wheeler_rate = getAreaAmount?.two_wheeler_rate || 0;
    const four_wheeler_rate = getAreaAmount?.four_wheeler_rate || 0;

    const time_diff = timeDifferenceInHours(in_time, out_time);

    let amount: number = 0;

    if (vehicle_type === 0) {
      amount = two_wheeler_rate * time_diff;
    } else {
      amount = four_wheeler_rate * time_diff;
    }

    type_parking_space === 0;

    const data = await prisma.receipts.create({
      data: {
        vehicle_no: req.body.vehicle_no,
        vehicle_type: vehicle_type === 0 ? "two_wheeler" : "four_wheeler",
        amount: type_parking_space === 0 ? amount : req.body.amount,
        type_parking_space:
          type_parking_space === 0 ? "Organized" : "UnOrganized",
        incharge_id: req.body.incharge_id,
        date: date,
        area_id: req.body.area_id,
        in_time: in_time,
        out_time: out_time,
        receipt_no: receipt_no,
        ulb_id: ulb_id
      },
      select: {
        amount: true,
        vehicle_no: true,
        vehicle_type: true,
        type_parking_space: true,
        incharge_id: true,

        area: {
          select: {
            id: true,
            address: true,
            zip_code: true,
            four_wheeler_capacity: true,
            two_wheeler_capacity: true,
            landmark: true,
            station: true,
          },
        },
        parking_incharge: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            age: true,
            blood_grp: true,
            mobile_no: true,
            emergency_mob_no: true,
            email_id: true,
            cunique_id: true,
          },
        },
        in_time: true,
        out_time: true,
        receipt_no: true,
        date: true,
      },
    });

    return generateRes(data);
  };

  // ======================== GET RECEIPTS =========================================//
  static get = async (req: Request) => {
    const { from_date, to_date, vehicle_no, incharge_id, area_id } = req.body;
    const page: number = Number(req.query.page);
    const limit: number = Number(req.query.limit);
    const search: string = String(req.query.search);
    const ulb_id = req?.body?.auth?.ulb_id || 2

    const d1 = new Date(from_date);
    const d2 = new Date(to_date);
    const query: Prisma.receiptsFindManyArgs = {
      skip: (page - 1) * limit,
      take: limit,
      select: {
        amount: true,
        area: {
          select: {
            id: true,
            address: true,
            zip_code: true,
            four_wheeler_capacity: true,
            two_wheeler_capacity: true,
            landmark: true,
            station: true,
          },
        },
        parking_incharge: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            age: true,
            blood_grp: true,
            mobile_no: true,
            emergency_mob_no: true,
            email_id: true,
            cunique_id: true,
          },
        },
        in_time: true,
        out_time: true,
        receipt_no: true,
        date: true,
      },
    };

    if (search !== "" && typeof search === "string" && search !== "undefined") {
      query.where = {
        ulb_id: ulb_id,
        OR: [
          {
            vehicle_no: { contains: search, mode: "insensitive" },
          },

          {
            parking_incharge: {
              first_name: { contains: search, mode: "insensitive" },
            },
          },

          {
            parking_incharge: {
              cunique_id: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    if (vehicle_no) {
      query.where = {
        ulb_id: ulb_id,
        OR: [
          {
            vehicle_no: { equals: vehicle_no, mode: "insensitive" },
          },
        ],
      };
    }

    if (from_date && to_date && incharge_id) {
      query.where = {
        ulb_id: ulb_id,
        AND: [
          {
            parking_incharge: {
              cunique_id: { equals: incharge_id, mode: "insensitive" },
            },
          },
          {
            date: {
              gte: d1,
              lte: d2,
            },
          },
        ],
      };
    }

    if (from_date && to_date && area_id) {
      query.where = {
        ulb_id: ulb_id,
        AND: [
          {
            area: {
              id: { equals: area_id },
            },
          },
          {
            date: {
              gte: d1,
              lte: d2,
            },
          },
        ],
      };
    }

    const [data, count] = await prisma.$transaction([
      prisma.receipts.findMany(query),
      prisma.receipts.count({ where: query.where }),
    ]);

    return generateRes({ data, count, page, limit });
  };

  four_wheeler_status = async (req: Request) => {
    const ulb_id = req?.body?.auth?.ulb_id || 2
    const date = new Date().toISOString().split("T")[0];
    const data = await prisma.$queryRawUnsafe(`
        SELECT COUNT(id)::INT FROM receipts where ulb_id=${ulb_id} and date = '${date}';
    `);

    return generateRes(data);
  };

  static getSchedule = async (incharge_id: string, area_id: number, date: Date, in_time: string) => {

    // const formattedDate = new Date("2024-09-24T11:49:16.302Z").toISOString().slice(0, 10);
    const formattedDate = new Date(date).toISOString().slice(0, 10);

    const inputDateTime = new Date(`${formattedDate}T${in_time}:00`);

    const schedule = await prisma.scheduler.findFirst({
      where: {
        incharge_id: {
          has: incharge_id
        },
        location_id: area_id,
        from_date: {
          lte: inputDateTime,
        },
        to_date: {
          gte: inputDateTime,
        },
        from_time: {
          lte: in_time,
        },
        to_time: {
          gte: in_time,
        }
      }
    })
    return schedule
  }

  // static createReceipt = async (req: Request) => {
  //   const { in_time } = req.body;
  //   const type_parking_space: type_parking_space = req.body.type_parking_space; //UnOrganized || Organized
  //   const vehicle_type: vehicle_type = req.body.vehicle_type; //four_wheeler || two_wheeler
  //   const ulb_id  = req?.body?.auth?.ulb_id || 2
  //   // let areaAmount: any

  //   const date = new Date();

  //   // const receipt_no = generateUniqueId("T0050");
  //   const receipt_no = await generateReceiptNumberV2(req.body.incharge_id, ulb_id);

  //   const schedule = await this.getSchedule(req.body.incharge_id, Number(req.body.area_id), date ? date : new Date(), in_time)

  //   // if (type_parking_space === 'UnOrganized') {
  //   //   areaAmount = await prisma.parking_area.findUnique({
  //   //     where: {
  //   //       id: Number(req.body.area_id),
  //   //     },
  //   //     select: {
  //   //       two_wheeler_rate: true,
  //   //       four_wheeler_rate: true,
  //   //     },
  //   //   });
  //   // }

  //   if (type_parking_space === 'Organized') {
  //     const isAlreadyIn = await prisma.receipts.count({
  //       where: {
  //         vehicle_no: req.body.vehicle_no,
  //         out_time: null
  //       }
  //     })
  //     if (isAlreadyIn !== 0) {
  //       throw new Error(`The vehicle ${req.body.vehicle_no} has not marked out yet`)
  //     }
  //   }

  //   const data = await prisma.receipts.create({
  //     data: {
  //       ...(type_parking_space === 'Organized' && { vehicle_no: req.body.vehicle_no }),
  //       vehicle_type: vehicle_type,
  //       type_parking_space: type_parking_space,
  //       incharge_id: req.body.incharge_id,
  //       date: date ? date : new Date(),
  //       area_id: Number(req.body.area_id),
  //       in_time: in_time,
  //       receipt_no: receipt_no,
  //       ulb_id: ulb_id,
  //       scheduler_id: schedule?.id
  //       // ...(type_parking_space === 'UnOrganized' && { out_time: in_time }),
  //       // ...(type_parking_space === 'UnOrganized' && { amount: vehicle_type === 'two_wheeler' ? areaAmount?.two_wheeler_rate : areaAmount?.four_wheeler_rate })
  //     },
  //     select: {
  //       receipt_no: true
  //     }
  //   });

  //   return generateRes(data);
  // };

  static createReceipt = async (req: Request) => {
    const { in_time, scheduler_id } = req.body;
    const type_parking_space: type_parking_space = req.body.type_parking_space; // UnOrganized || Organized
    const vehicle_type: vehicle_type = req.body.vehicle_type; // four_wheeler || two_wheeler
    const ulb_id = req?.body?.auth?.ulb_id || 2;

    const date = new Date();

    // const receipt_no = generateUniqueId("T0050");
    const receipt_no = await generateReceiptNumberV2(req.body.incharge_id, ulb_id);

    const schedule = await this.getSchedule(req.body.incharge_id, Number(req.body.area_id), date ? date : new Date(), in_time)

    // if (type_parking_space === 'UnOrganized') {
    //   areaAmount = await prisma.parking_area.findUnique({
    //     where: {
    //       id: Number(req.body.area_id),
    //     },
    //     select: {
    //       two_wheeler_rate: true,
    //       four_wheeler_rate: true,
    //     },
    //   });
    // }

    if (type_parking_space === 'Organized') {
      const isAlreadyIn = await prisma.receipts.count({
        where: {
          vehicle_no: req.body.vehicle_no,
          out_time: null
        }
      })
      if (isAlreadyIn !== 0) {
        throw new Error(`The vehicle ${req.body.vehicle_no} has not marked out yet`)
      }
    }

    const data = await prisma.receipts.create({
      data: {
        ...(type_parking_space === 'Organized' && { vehicle_no: req.body.vehicle_no }),
        vehicle_type: vehicle_type,
        type_parking_space: type_parking_space,
        incharge_id: req.body.incharge_id,
        date: date ? date : new Date(),
        area_id: Number(req.body.area_id),
        in_time: in_time,
        receipt_no: receipt_no,
        ulb_id: ulb_id,
        scheduler_id: schedule?.id
        // ...(type_parking_space === 'UnOrganized' && { out_time: in_time }),
        // ...(type_parking_space === 'UnOrganized' && { amount: vehicle_type === 'two_wheeler' ? areaAmount?.two_wheeler_rate : areaAmount?.four_wheeler_rate })
      },
      select: {
        receipt_no: true
      }
    });

    return generateRes(data);
  };

  static getReceipt = async (req: Request) => {
    const { receipt_no } = req.params;

    if (!receipt_no) {
      throw new Error('Receipt Number is required')
    }

    const data: any = await prisma.receipts.findFirst({
      where: {
        receipt_no: receipt_no
      },
      include: {
        area: {
          select: {
            id: true,
            address: true,
            zip_code: true,
            station: true,
            landmark: true,
            two_wheeler_capacity: true,
            four_wheeler_capacity: true,
            two_wheeler_rate: true,
            four_wheeler_rate: true,
            total_parking_area: true,
            ulb_id: true,
            type_parking_space: true,
          }
        }
      }
    });

    data.parking_area = data?.area?.address

    return generateRes(data);
  };

  static calculateAmount = async (req: Request) => {
    const { out_time, receipt_no } = req.body;

    if (!receipt_no) {
      throw new Error('Receipt Number is required')
    }

    const receipt = await prisma.receipts.findFirst({
      where: {
        receipt_no: receipt_no
      },
      select: {
        in_time: true,
        type_parking_space: true,
        vehicle_type: true,
        area_id: true,
        out_time: true
      }
    })

    if (!receipt) {
      throw new Error('No receipt found')
    }

    if (!out_time && receipt?.type_parking_space === 'Organized') {
      throw new Error('Out time is required')
    }

    if (receipt?.out_time !== null) {
      throw new Error('Vehicle already marked out')
    }

    const getAreaAmount = await prisma.parking_area.findUnique({
      where: {
        id: receipt?.area_id,
      },
      select: {
        two_wheeler_rate: true,
        four_wheeler_rate: true,
      },
    });

    const two_wheeler_rate = getAreaAmount?.two_wheeler_rate || 0;
    const four_wheeler_rate = getAreaAmount?.four_wheeler_rate || 0;

    const time_diff = timeDifferenceInHours(receipt?.in_time, out_time ? out_time : receipt?.in_time);

    let amount: number = 0;

    if (receipt?.vehicle_type === 'two_wheeler') {
      amount = receipt?.type_parking_space === 'Organized' ? two_wheeler_rate * time_diff : two_wheeler_rate;
    } else {
      amount = receipt?.type_parking_space === 'Organized' ? four_wheeler_rate * time_diff : four_wheeler_rate;
    }

    return generateRes({ amount: amount });
  };

  static createReceiptOut = async (req: Request) => {
    const { out_time, receipt_no, out_amount, payment_mode, area_Id , ulb_Id } = req.body;

    if (!receipt_no) {
      throw new Error('Receipt Number is required')
    }

    const receipt = await prisma.receipts.findFirst({
      where: {
        receipt_no: receipt_no
      },
      select: {
        in_time: true,
        type_parking_space: true,
        vehicle_type: true,
        area_id: true,
        out_time: true
      }
    })

    if (!receipt) {
      throw new Error('No receipt found')
    }

    if (!out_time && receipt?.type_parking_space === 'Organized') {
      throw new Error('Out time is required')
    }

    if (receipt?.out_time !== null) {
      throw new Error('Vehicle already marked out')
    }

    const getAreaAmount = await prisma.parking_area.findUnique({
      where: {
        id: receipt?.area_id,
      },
      select: {
        two_wheeler_rate: true,
        four_wheeler_rate: true,
      },
    });

    const two_wheeler_rate = getAreaAmount?.two_wheeler_rate || 0;
    const four_wheeler_rate = getAreaAmount?.four_wheeler_rate || 0;

    const time_diff = timeDifferenceInHours(receipt?.in_time, out_time ? out_time : receipt?.in_time);

    let amount: number = 0;

    // if (receipt?.vehicle_type === 'two_wheeler') {
    //   amount = two_wheeler_rate * time_diff;
    // } else {
    //   amount = four_wheeler_rate * time_diff;
    // }
    if (receipt?.vehicle_type === 'two_wheeler') {
      amount = receipt?.type_parking_space === 'Organized' ? two_wheeler_rate * time_diff : two_wheeler_rate;
    } else {
      amount = receipt?.type_parking_space === 'Organized' ? four_wheeler_rate * time_diff : four_wheeler_rate;
    }

    if (Number(out_amount) !== amount) {
      throw new Error('Payment amount invalid')
    }

    const data = await prisma.receipts.update({
      where: {
        receipt_no: receipt_no
      },
      data: {
        amount: amount,
        out_time: out_time ? out_time : receipt?.in_time,
        is_paid: true,
        payment_mode: payment_mode as string
      },
      include: {
        area: {
          select: {
            address: true,
            zip_code: true,
            station: true,
            landmark: true,
            two_wheeler_capacity: true,
            two_wheeler_rate: true,
            four_wheeler_capacity: true,
            four_wheeler_rate: true,
            total_parking_area: true
          }
        }
      }
    })

    return generateRes(data);
  };


//   static createReceiptOut = async (req: Request) => {
//     const { out_time, receipt_no, out_amount, payment_mode, area_Id, ulb_Id } = req.body;

//     if (!receipt_no) {
//         throw new Error('Receipt Number is required');
//     }

//     // Fetch the receipt details from the database
//     const receipt = await prisma.receipts.findFirst({
//         where: {
//             receipt_no: receipt_no
//         },
//         select: {
//             in_time: true,
//             type_parking_space: true,
//             vehicle_type: true,
//             area_id: true,
//             ulb_id: true,  // Make sure to include ulb_id
//             out_time: true
//         }
//     });

//     // If receipt not found, throw an error
//     if (!receipt) {
//         throw new Error('No receipt found');
//     }

//     // Check if the area_id and ulb_id in the request match the ones in the receipt
//     if (receipt.area_id !== area_Id || receipt.ulb_id !== ulb_Id) {
//         throw new Error('Area or ULB ID mismatch');
//     }

//     // Check if out_time is provided for Organized parking space
//     if (!out_time && receipt?.type_parking_space === 'Organized') {
//         throw new Error('Out time is required');
//     }

//     // Check if the vehicle is already marked out
//     if (receipt?.out_time !== null) {
//         throw new Error('Vehicle already marked out');
//     }

//     // Retrieve the parking area rates
//     const getAreaAmount = await prisma.parking_area.findUnique({
//         where: {
//             id: receipt?.area_id,
//         },
//         select: {
//             two_wheeler_rate: true,
//             four_wheeler_rate: true,
//         },
//     });

//     const two_wheeler_rate = getAreaAmount?.two_wheeler_rate || 0;
//     const four_wheeler_rate = getAreaAmount?.four_wheeler_rate || 0;

//     // Calculate the time difference
//     const time_diff = timeDifferenceInHours(receipt?.in_time, out_time ? out_time : receipt?.in_time);

//     let amount: number = 0;

//     // Calculate the amount based on vehicle type and parking space type
//     if (receipt?.vehicle_type === 'two_wheeler') {
//         amount = receipt?.type_parking_space === 'Organized' ? two_wheeler_rate * time_diff : two_wheeler_rate;
//     } else {
//         amount = receipt?.type_parking_space === 'Organized' ? four_wheeler_rate * time_diff : four_wheeler_rate;
//     }

//     // Check if the out_amount is correct
//     if (Number(out_amount) !== amount) {
//         throw new Error('Payment amount invalid');
//     }

//     // Update the receipt with the calculated amount and other details
//     const data = await prisma.receipts.update({
//         where: {
//             receipt_no: receipt_no
//         },
//         data: {
//             amount: amount,
//             out_time: out_time ? out_time : receipt?.in_time,
//             is_paid: true,
//             payment_mode: payment_mode as string
//         },
//         include: {
//             area: {
//                 select: {
//                     address: true,
//                     zip_code: true,
//                     station: true,
//                     landmark: true,
//                     two_wheeler_capacity: true,
//                     two_wheeler_rate: true,
//                     four_wheeler_capacity: true,
//                     four_wheeler_rate: true,
//                     total_parking_area: true
//                 }
//             }
//         }
//     });

//     return generateRes(data);
// };

  static getInVehicle = async (req: Request) => {
    const { vehicle_no } = req.params;

    if (!vehicle_no) {
      throw new Error('Vehicle Number is required')
    }

    const data = await prisma.receipts.findFirst({
      where: {
        vehicle_no: vehicle_no,
        out_time: null
      }
    });

    console.log(data)

    return generateRes(data);
  };

  static getAmountUnorganized = async (req: Request) => {
    const vehicle_type: vehicle_type = req.body.vehicle_type; //four_wheeler || two_wheeler

    const areaAmount = await prisma.parking_area.findUnique({
      where: {
        id: Number(req.body.area_id),
      },
      select: {
        two_wheeler_rate: true,
        four_wheeler_rate: true,
      },
    });

    return generateRes({ areaAmount: vehicle_type === 'two_wheeler' ? areaAmount?.two_wheeler_rate : areaAmount?.four_wheeler_rate });
  };

  static createReceiptUnorganized = async (req: Request) => {
    const { in_time, amount, payment_mode } = req.body;
    const vehicle_type: vehicle_type = req.body.vehicle_type; //four_wheeler || two_wheeler
    const ulb_id = req?.body?.auth?.ulb_id || 2

    const date = new Date();

    const schedule = await this.getSchedule(req.body.incharge_id, Number(req.body.area_id), date ? date : new Date(), in_time)

    // const receipt_no = generateUniqueId("T0050");
    const receipt_no = await generateReceiptNumberV2(req.body.incharge_id, ulb_id);

    const areaAmount = await prisma.parking_area.findUnique({
      where: {
        id: Number(req.body.area_id),
      },
      select: {
        two_wheeler_rate: true,
        four_wheeler_rate: true,
      },
    });

    if ((vehicle_type === 'two_wheeler' ? areaAmount?.two_wheeler_rate : areaAmount?.four_wheeler_rate) !== amount) {
      throw new Error('Invalid payment amount')
    }

    const data = await prisma.receipts.create({
      data: {
        vehicle_type: vehicle_type,
        type_parking_space: 'UnOrganized',
        incharge_id: req.body.incharge_id,
        date: date ? date : new Date(),
        area_id: Number(req.body.area_id),
        in_time: in_time,
        out_time: in_time,
        receipt_no: receipt_no,
        ulb_id: ulb_id,
        is_paid: true,
        payment_mode: payment_mode as string,
        amount: vehicle_type === 'two_wheeler' ? areaAmount?.two_wheeler_rate : areaAmount?.four_wheeler_rate,
        scheduler_id: schedule?.id
      },
      include: {
        area: {
          select: {
            address: true,
            zip_code: true,
            station: true,
            landmark: true,
            two_wheeler_capacity: true,
            two_wheeler_rate: true,
            four_wheeler_capacity: true,
            four_wheeler_rate: true,
            total_parking_area: true
          }
        }
      }
    });

    return generateRes(data);
  };

  static submitAmount = async (req: Request) => {

    type validationPayload = {
      incharge_id: string,
      date?: Date,
      description: string
    }

    const { incharge_id, description, date = new Date() }: validationPayload = req.body;

    function startsWithDigit(id: string) {
      return /^\d/.test(id);
    }

    const generateTransactionId = (incharge_id: string) => {
      const randomFiveDigit = Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = String(now.getFullYear()).slice(-2)
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')

      let initial = String(randomFiveDigit)

      if (startsWithDigit(incharge_id)) {
        initial = incharge_id
      }

      const randomDigit = Math.floor(1 + Math.random() * 9);
      const generatedString = `${initial}${day}${month}${year}${hours}${minutes}${randomDigit}`;

      return generatedString
    }

    const receiptsSum = await prisma.receipts.aggregate({
      where: {
        incharge_id: incharge_id,
        date: typeof (date) === 'string' ? new Date(date) : date,
        is_validated: false,
        payment_mode: 'cash',
        is_paid: true
      },
      _sum: {
        amount: true
      }
    })

    if (receiptsSum?._sum?.amount === null) {
      throw new Error('No receipt for validation')
    }

    const receipts = await prisma.receipts.findFirst({
      where: {
        incharge_id: incharge_id,
        date: typeof (date) === 'string' ? new Date(date) : date,
        is_validated: false,
        payment_mode: 'cash'
      },
      select: {
        incharge_id: true,
        area_id: true,
        is_paid: true,
        scheduler_id: true
      }
    })

    const transactionId = generateTransactionId(incharge_id)

    await prisma.$transaction(async (tx) => {
      await tx.accounts_summary.create({
        data: {
          incharge_id: incharge_id,
          total_amount: receiptsSum?._sum?.amount || 0,
          date: typeof (date) === 'string' ? new Date(date) : date,
          description: description || '',
          transaction_id: transactionId,
          area_id: receipts?.area_id as number,
          transaction_type: 'cash',
          scheduler_id: receipts?.scheduler_id
        }
      })
      await tx.receipts.updateMany({
        where: {
          incharge_id: incharge_id,
          date: typeof (date) === 'string' ? new Date(date) : date,
          is_validated: false,
        },
        data: {
          is_validated: true,
          transaction_id: transactionId
        }
      })
    })

    return {
      amount: receiptsSum?._sum?.amount || 0,
      transaction_id: transactionId,
      date: typeof (date) === 'string' ? new Date(date) : date
    }
  };

  static getAmount = async (req: Request) => {

    const { incharge_id } = req.params;

    const receiptsSum = await prisma.receipts.aggregate({
      where: {
        incharge_id: incharge_id,
        date: new Date(),
        is_validated: false,
        payment_mode: 'cash',
        is_paid: true
      },
      _sum: {
        amount: true
      }
    })

    if (receiptsSum?._sum?.amount === null) {
      throw new Error('No receipt for validation')
    }

    return generateRes({ amount: receiptsSum?._sum?.amount });
  };

  static getReceiptData = async (req: Request) => {

    const whereClause: Prisma.receiptsWhereInput = {}

    const { parkingType = 'Organized', fromDate, toDate } = req.query;
    const search: string | undefined = req?.query?.search ? String(req?.query?.search) : undefined

    // if (!parkingType) {
    //   throw new Error('Parking type is required as "parkingType"')
    // }

    whereClause.type_parking_space = parkingType as type_parking_space

    if (search) {
      whereClause.OR = [
        {
          incharge_id: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          parking_incharge: {
            first_name: {
              contains: search,
              mode: 'insensitive',
            }
          },
        },
        {
          parking_incharge: {
            last_name: {
              contains: search,
              mode: 'insensitive',
            }
          },
        },
        {
          vehicle_no: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          receipt_no: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    whereClause.AND = [
      ...(fromDate
        ? [
          {
            date: {
              gte: new Date(fromDate as string)
            },
          },
        ]
        : []),
      ...(toDate
        ? [
          {
            date: {
              lte: new Date(toDate as string)
            },
          },
        ]
        : []),
    ]

    const receiptDetails = await prisma.receipts.findMany({
      where: whereClause
    })

    console.log(receiptDetails)

    return generateRes(receiptDetails);
  };

}

export default ReceiptDao;
