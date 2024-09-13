/**
 * Author: Krish Vishwakarma
 * status: Open
 *  Use: Manage Parking Areas
 */

import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ParkingAreaDao {
  async create(req: Request) {
    const {
      address,
      zip_code,
      station,
      landmark,
      two_wheeler_capacity,
      four_wheeler_capacity,

      total_parking_area,
      type_parking_space,
      agreement_doc,
      two_wheeler_rate,
      four_wheeler_rate,
    } = req.body;

    const { ulb_id } = req.body.auth

    const query: Prisma.parking_areaCreateArgs = {
      data: {
        address: address,
        zip_code: zip_code,
        station: station,
        landmark: landmark,
        two_wheeler_capacity: parseInt(two_wheeler_capacity),
        four_wheeler_capacity: parseInt(four_wheeler_capacity),
        total_parking_area: parseInt(total_parking_area),
        type_parking_space:
          Number(type_parking_space) === 0 ? "Organized" : "UnOrganized",
        agreement_doc: agreement_doc,
        two_wheeler_rate: parseInt(two_wheeler_rate),
        four_wheeler_rate: parseInt(four_wheeler_rate),
        ulb_id: ulb_id,
      },
    };

    const data = await prisma.parking_area.create(query);

    return generateRes(data);
  }

  async get(req: Request) {
    const { zip_code, station, search } = req.query;
    const limit: number = Number(req.query.limit);
    const page: number = Number(req.query.page);
    const { ulb_id } = req.body.auth

    try {
      const offset = (page - 1) * limit;

      const qr_func = (extend?: string) => {
        return `
          SELECT * FROM parking_area ${extend ? extend : ""} order by id desc LIMIT $1 OFFSET $2
        `;
      };
      let qr = qr_func();

      let searchConditions: string = "";

      // ------------------  FILTER ------------------//
      if (search !== "" && search !== undefined) {
        qr = qr_func(`
          WHERE 
          address ILIKE '%${search}%'
          OR zip_code ILIKE '%${search}%' 
          OR station ILIKE '%${search}%'
        `);
      } else if (
        (zip_code !== "" && zip_code !== undefined) ||
        (station !== "" && station !== undefined)
      ) {
        const condition: string[] = [];

        if (zip_code) {
          condition.push(`
          WHERE zip_code ILIKE '${zip_code}'
        `);
        }

        if (station) {
          condition.push(`
          WHERE station ILIKE '${station}'
        `);
        }

        searchConditions += condition.join(" AND ");

        qr = qr_func(searchConditions);
      }

      // -------------------  FILTER -------------------//

      const data = 'where'
      const regex = new RegExp(`\\b${data}\\b`, 'i');
      const conditionRegex = /(ORDER BY.*?)(LIMIT \$\d OFFSET \$\d|LIMIT \$\d|OFFSET \$\d)?$/i
      if (regex.test(qr)) {
        qr = qr.replace(conditionRegex, `$1 AND ulb_id = '${ulb_id}' $2`);
      } else {
        qr = qr.replace(conditionRegex, `WHERE ulb_id = '${ulb_id}' $1`);
      }

      // -------------------  PAGINING -------------------//
      const countQuery = `
        SELECT COUNT(id)::INT FROM parking_area ${searchConditions};
      `;
      const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
      const totalItems = parseInt(countResult[0].count);
      console.log(totalItems);
      const totalPages = Math.ceil(totalItems / limit);
      // -------------------  PAGINING -------------------//

      console.log(qr);

      const dataResult = await prisma.$queryRawUnsafe<any[]>(qr, limit, offset);

      return generateRes({
        page,
        totalItems,
        totalPages,
        data: dataResult,
      });
    } catch (error) {
      console.log(error);
      return { message: "Something went wrong" };
    }
  }

  async get_all_parking_area(req: Request) {
    const { ulb_id } = req.body.auth
    const data = await prisma.parking_area.findMany({
      where: {
        ulb_id: ulb_id
      },
      select: {
        id: true,
        address: true,
        station: true,
      },
    });
    return generateRes(data);
  }

  async delete_parking_area(req: Request) {
    const { id } = req.body;
    const data = await prisma.parking_area.delete({
      where: {
        id: parseInt(id),
      },
    });

    return generateRes(data);
  }
}

export default ParkingAreaDao;
