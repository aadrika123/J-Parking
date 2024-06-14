import { Request } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { generateRes } from "../../../../util/generateRes";
import { generateUnique } from "../../../../util/helper/generateUniqueNo";
import { timeDifferenceInHours } from "../../../../util/helper";

const prisma = new PrismaClient();

export const genrateDate = () => {};
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
    const type_parking_space: number = req.body.type_parking_space;
    const vehicle_type: number = req.body.vehicle_type;

    const date = new Date();
    const receipt_no = generateUnique("PK");

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

    if (vehicle_type === 0) {
      req.body.amount = two_wheeler_rate * time_diff;
    } else {
      req.body.amount = four_wheeler_rate * time_diff;
    }

    const data = await prisma.receipts.create({
      data: {
        vehicle_no: req.body.vehicle_no,
        vehicle_type: vehicle_type === 0 ? "two_wheeler" : "four_wheeler",
        amount: req.body.amount,
        type_parking_space:
          type_parking_space === 0 ? "Organized" : "UnOrganized",
        incharge_id: req.body.incharge_id,
        date: date,
        area_id: req.body.area_id,
        in_time: in_time,
        out_time: out_time,
        receipt_no: receipt_no,
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
        OR: [
          {
            vehicle_no: { equals: vehicle_no, mode: "insensitive" },
          },
        ],
      };
    }

    if (from_date && to_date && incharge_id) {
      query.where = {
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

  four_wheeler_status = async () => {
    const date = new Date().toISOString().split("T")[0];
    const data = await prisma.$queryRawUnsafe(`
        SELECT COUNT(id)::INT FROM receipts where date = '${date}';
    `);

    return generateRes(data);
  };
}

export default ReceiptDao;
