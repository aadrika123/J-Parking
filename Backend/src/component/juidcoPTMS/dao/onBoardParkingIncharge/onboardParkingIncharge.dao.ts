/**
 * Author: Krish Vishwakarma
 * status: Open
 *  Use: Manage Parking Incharge
 */

import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";
import generateUniqueId from "../../../../util/helper/generateUniqueNo";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ParkingInchargeDao {
  async create(req: Request) {
    const {
      first_name,
      middle_name,
      last_name,
      age,
      blood_grp,
      mobile_no,
      address,
      email_id,
      emergency_mob_no,
      kyc_doc,
      fitness_doc
    } = req.body;

    const { ulb_id } = req.body.auth

    const isExistingConductorEmail = await prisma.parking_incharge.findFirst({
      where: { email_id: email_id },
    });

    if (isExistingConductorEmail) {
      return generateRes({
        status: 409,
        error_type: "VALIDATION",
        validation_error: "Email Already Exist",
      });
    }

    // const ulb_code = await prisma.$queryRaw<any[]>`
    //   SELECT code FROM ulb_masters WHERE id = ${ulb_id}::INT
    // `;

    // const uniqueId = generateUniqueId(`PMSA-${ulb_code[0]?.code}-`);
    const uniqueId = generateUniqueId(`PMSA-$-`);

    const date = new Date();
    const query: Prisma.parking_inchargeCreateArgs = {
      data: {
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        age: age,
        blood_grp: blood_grp,
        mobile_no: mobile_no,
        address: address,
        email_id: email_id,
        emergency_mob_no: emergency_mob_no,
        kyc_doc: kyc_doc,
        fitness_doc: fitness_doc,
        ulb_id: ulb_id,
        cunique_id: uniqueId,
        updated_at: date,
      },
    };

    const data = await prisma.parking_incharge.create(query);

    return generateRes(data);
  }

  async get(req: Request) {
    const { cunique_id, name, search } = req.query;
    const limit: number = Number(req.query.limit);
    const page: number = Number(req.query.page);
    const { ulb_id } = req.body.auth

    const offset = (page - 1) * limit;

    const qr_func = (extend?: string) => {
      return `
        SELECT * FROM parking_incharge ${extend ? extend : ""
        } LIMIT $1 OFFSET $2
      `;
    };
    let qr = qr_func();

    let searchConditions = "";

    // ------------------  FILTER ------------------//

    if (search !== "" && search !== undefined) {
      qr = qr_func(`
        WHERE 
        first_name ILIKE '%${search}%' 
        OR last_name ILIKE '%${search}%'
        OR CAST(cunique_id AS TEXT) ILIKE '%${search}%'
      `);
    } else if (
      (cunique_id !== "" && cunique_id !== undefined) ||
      (name !== "" && name !== undefined)
    ) {
      const condition: string[] = [];

      if (cunique_id) {
        condition.push(`
          WHERE cunique_id ILIKE '${cunique_id}'
        `);
      }

      if (name) {
        condition.push(`
          WHERE first_name ILIKE '${name}'
        `);
      }

      searchConditions += condition.join(" AND ");

      qr = qr_func(searchConditions);

    }

    const data = 'where'
    const regex = new RegExp(`\\b${data}\\b`, 'i');
    const conditionRegex = /(ORDER BY.*?)(LIMIT \$\d OFFSET \$\d|LIMIT \$\d|OFFSET \$\d)?$/i
    if (regex.test(qr)) {
      qr = qr.replace(conditionRegex, `$1 AND ulb_id = '${ulb_id}' $2`);
    } else {
      qr = qr.replace(conditionRegex, `WHERE ulb_id = '${ulb_id}' $1`);
    }

    const countQuery = `
      SELECT COUNT(id)::INT FROM parking_incharge ${searchConditions};
    `;
    // -------------------  FILTER -------------------//

    const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
    const totalItems = parseInt(countResult[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const dataResult = await prisma.$queryRawUnsafe<any[]>(qr, limit, offset);

    return generateRes({ page, totalItems, totalPages, data: dataResult });
  }

  async delete(req: Request) {
    const { id } = req.body;

    const data = await prisma.parking_incharge.delete({
      where: { id: Number(id) },
    });

    return generateRes(data);
  }
}

export default ParkingInchargeDao;
