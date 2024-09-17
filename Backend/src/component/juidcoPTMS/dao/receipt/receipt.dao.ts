import { Request } from "express";
import { Prisma, PrismaClient, type_parking_space, vehicle_type } from "@prisma/client";
import { generateRes } from "../../../../util/generateRes";
import generateUniqueId from "../../../../util/helper/generateUniqueNo";
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
    const { ulb_id } = req.body.auth

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
    const { ulb_id } = req.body.auth

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
    const { ulb_id } = req.body.auth
    const date = new Date().toISOString().split("T")[0];
    const data = await prisma.$queryRawUnsafe(`
        SELECT COUNT(id)::INT FROM receipts where ulb_id=${ulb_id} and date = '${date}';
    `);

    return generateRes(data);
  };

  static createReceipt = async (req: Request) => {
    const { in_time } = req.body;
    const type_parking_space: type_parking_space = req.body.type_parking_space; //UnOrganized || Organized
    const vehicle_type: vehicle_type = req.body.vehicle_type; //four_wheeler || two_wheeler
    const { ulb_id } = req.body.auth
    let areaAmount: any

    const date = new Date();

    const receipt_no = generateUniqueId("T0050");

    if (type_parking_space === 'UnOrganized') {
      areaAmount = await prisma.parking_area.findUnique({
        where: {
          id: Number(req.body.area_id),
        },
        select: {
          two_wheeler_rate: true,
          four_wheeler_rate: true,
        },
      });
    }

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
        ...(type_parking_space === 'UnOrganized' && { out_time: in_time }),
        ...(type_parking_space === 'UnOrganized' && { amount: vehicle_type === 'two_wheeler' ? areaAmount?.two_wheeler_rate : areaAmount?.four_wheeler_rate })
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

    const data = await prisma.receipts.findFirst({
      where: {
        receipt_no: receipt_no
      }
    });

    return generateRes(data);
  };

  static calculateAmount = async (req: Request) => {
    const { out_time, receipt_no } = req.body;

    if (!receipt_no) {
      throw new Error('Receipt Number is required')
    }

    if (!out_time) {
      throw new Error('Out time is required')
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

    const time_diff = timeDifferenceInHours(receipt?.in_time, out_time);

    let amount: number = 0;

    if (receipt?.vehicle_type === 'two_wheeler') {
      amount = two_wheeler_rate * time_diff;
    } else {
      amount = four_wheeler_rate * time_diff;
    }

    return generateRes({ amount: amount });
  };

  static createReceiptOut = async (req: Request) => {
    const { out_time, receipt_no, out_amount } = req.body;

    if (!receipt_no) {
      throw new Error('Receipt Number is required')
    }

    if (!out_time) {
      throw new Error('Out time is required')
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

    const time_diff = timeDifferenceInHours(receipt?.in_time, out_time);

    let amount: number = 0;

    if (receipt?.vehicle_type === 'two_wheeler') {
      amount = two_wheeler_rate * time_diff;
    } else {
      amount = four_wheeler_rate * time_diff;
    }

    if (Number(out_amount) !== amount) {
      throw new Error('Complete the payment first')
    }

    const data = await prisma.receipts.update({
      where: {
        receipt_no: receipt_no
      },
      data: {
        amount: amount,
        out_time: out_time,
        is_paid: true
      }
    })

    return generateRes(data);
  };

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

}

export default ReceiptDao;
