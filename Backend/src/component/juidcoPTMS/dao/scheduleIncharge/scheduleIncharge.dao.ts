import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ScheduleInchargeDao {
  getDetailsByLocation = async (req: Request) => {
    const location: string = String(req.body.location);

    const qr_1 = await prisma.$queryRawUnsafe(`
      select address from parking_area where address ILIKE '%${location}%'
    `);

    const qr_2 = await prisma.$queryRawUnsafe(`
      select first_name, cunique_id, address from parking_incharge where address ILIKE '%${location}%'
    `);

    const data = {
      area: qr_1,
      incharge: qr_2,
    };

    return data;
  };

  createScheduleIncharge = async (req: Request) => {
    const {
      location_id,
      incharge_id,
      from_date,
      to_date,
      from_time,
      to_time,
    } = req.body;

    const setFromTime = Number(from_time.replace(":", "").padStart(4, "0"));
    const setToTime = Number(to_time.replace(":", "").padStart(4, "0"));

    try {
      const checkFromDate = await prisma.$queryRawUnsafe<any[]>(`
       select id from scheduler where '${from_date}' between from_date and to_date 
       or'${to_date}' between from_date and to_date 
      `);

      if (checkFromDate.length > 0) {
        return generateRes({
          error_type: "VALIDATION",
          id: checkFromDate[0].id,
          validation_error: "Already Exist",
        });
      }
    } catch (err) {
      console.log(err);
      return err;
    }

    const qr_create_schedule: Prisma.schedulerCreateArgs = {
      data: {
        location_id: location_id,
        incharge_id: incharge_id,
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        from_time: setFromTime,
        to_time: setToTime,
      },
    };

    const createNewSchedule = await prisma.scheduler.create(qr_create_schedule);

    // const createNewSchedule = createMany("scheduler", qr_create_schedule);

    return generateRes(createNewSchedule);
  };

  async updateSchedulerIncharge(req: Request) {
    const {
      id,
      location_id,
      incharge_id,
      from_date,
      to_date,
      from_time,
      to_time,
    } = req.body;

    const setFromTime = Number(from_time.replace(":", "").padStart(4, "0"));
    const setToTime = Number(to_time.replace(":", "").padStart(4, "0"));

    const query = `
    UPDATE scheduler 
    SET 
      location_id = $1,
      incharge_id = $2,
      from_date = $3,
      to_date = $4,
      from_time = $5,
      to_time = $6,
      updated_at = NOW()
    WHERE id = $7
    RETURNING *;
  `;


    const values = [
      location_id,
      incharge_id,
      new Date(from_date),
      new Date(to_date),
      setFromTime,
      setToTime,
      id,
    ];

    try {
      const result = await prisma.$queryRawUnsafe<any[]>(query, ...values);
      if (result.length > 0) {
        return {
          status: "success",
          data: result[0],
        };
      } else {
        return {
          status: "error",
          message: "Scheduler not found",
        };
      }
    } catch (error) {
      console.error("Error executing query", error);
      return {
        status: "error",
        message: "Internal Server Error",
      };
    }
  }

  deleteScheduler = async (req: Request) => {
    const { id } = req.body;

    const query = `
      DELETE FROM scheduler
      WHERE id = $1
      RETURNING *;
    `;

    const values = [id];

    try {
      const result = await prisma.$queryRawUnsafe<any[]>(query, values);
      if (result.length > 0) {
        return {
          status: "success",
          message: "Scheduler deleted successfully",
          data: result[0],
        };
      } else {
        return {
          status: "error",
          message: "Scheduler not found",
        };
      }
    } catch (error) {
      console.error("Error executing query", error);
      return {
        status: "error",
        message: "Internal Server Error",
      };
    }
  };

  async getScheduleIncharge(req: Request) {
    const { incharge_id, incharge_name, search } = req.query;
    const limit: number = Number(req.query.limit) || 10;
    const page: number = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const qr_func = (extend?: string) => {
      return `
        SELECT scheduler.*, pa.address, pk.cunique_id, pk.first_name, pk.middle_name, pk.last_name 
        FROM scheduler
        JOIN parking_incharge AS pk ON scheduler.incharge_id = pk.cunique_id
        JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
        ${extend ? extend : ""}
        LIMIT ${limit} OFFSET ${offset}
      `;
    };

    let qr = qr_func();

    let searchConditions = "";

    // ------------------  FILTER ------------------//

    if (search && search !== "") {
      qr = qr_func(`
        WHERE 
        pk.first_name ILIKE '%${search}%' 
        OR CAST(scheduler.incharge_id AS TEXT) ILIKE '%${search}%'
      `);
    } else if (
      (incharge_id && incharge_id !== "") ||
      (incharge_name && incharge_name !== "")
    ) {
      const condition: string[] = [];

      if (incharge_id) {
        condition.push(`scheduler.incharge_id ILIKE '${incharge_id}'`);
      }

      if (incharge_name) {
        condition.push(`pk.first_name ILIKE '${incharge_name}'`);
      }

      searchConditions = `WHERE ${condition.join(" AND ")}`;

      qr = qr_func(searchConditions);
    }

    const countQuery = `
      SELECT COUNT(*) FROM scheduler 
      JOIN parking_incharge AS pk ON scheduler.incharge_id = pk.cunique_id
      JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
      ${searchConditions};
    `;
    // -------------------  FILTER -------------------//

    try {
      const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
      const totalItems = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      console.log(qr);

      const dataResult = await prisma.$queryRawUnsafe<any[]>(qr);

      console.log("qr", qr)

      console.log("dataResult", dataResult)
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

export default ScheduleInchargeDao;



/*
 */