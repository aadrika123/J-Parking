import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ScheduleInchargeDao {
  getDetailsByLocation = async (req: Request) => {
    const location: string = String(req.body.location);
    const { ulb_id } = req.body.auth

    const qr_1 = await prisma.$queryRawUnsafe(`
      select address from parking_area where ulb_id=${ulb_id} and address ILIKE '%${location}%'
    `);

    const qr_2 = await prisma.$queryRawUnsafe(`
      select first_name, cunique_id, address from parking_incharge where ulb_id=${ulb_id} address ILIKE '%${location}%'
    `);

    const data = {
      area: qr_1,
      incharge: qr_2,
    };

    return data;
  };

  createScheduleIncharge = async (req: Request) => {
    const { location_id, incharge_id, from_date, to_date, from_time, to_time } =
      req.body;
    const { ulb_id } = req.body.auth

    // const setFromTime = Number(from_time.replace(":", "").padStart(4, "0"));
    // const setToTime = Number(to_time.replace(":", "").padStart(4, "0"));

    try {
      const new_from_time = Number(from_time.split(":").join(""));

      console.log(
        `
       select id from scheduler where ulb_id=${ulb_id} and (location_id=${location_id} or '${incharge_id}' = any(incharge_id)) and ('${from_date}' between from_date and to_date 
       or '${to_date}' between from_date and to_date) and CAST(REPLACE(to_time, ':', '') AS INT) >= ${new_from_time}
      `
      ,'abcabcbac')

      const checkFromDate = await prisma.$queryRawUnsafe<any[]>(`
       select id from scheduler where ulb_id=${ulb_id} and (location_id=${location_id} or '${incharge_id}' = any(incharge_id)) and ('${from_date}' between from_date and to_date 
       or '${to_date}' between from_date and to_date) and CAST(REPLACE(to_time, ':', '') AS INT) >= ${new_from_time}
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
        incharge_id: incharge_id as string[],
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        from_time: from_time,
        to_time: to_time,
        ulb_id: ulb_id
      },
    };

    const createNewSchedule = await prisma.scheduler.create(qr_create_schedule);

    // const createNewSchedule = createMany("scheduler", qr_create_schedule);

    return generateRes(createNewSchedule);
  };

  async updateSchedulerIncharge(req: Request) {
    const {
      id,
      incharge_id,
      from_date,
      to_date,
      from_time,
      to_time,
      extended_hours
    } = req.body;

    // const setFromTime = Number(from_time.replace(":", "").padStart(4, "0"));
    // const setToTime = Number(to_time.replace(":", "").padStart(4, "0"));

    //   const query = `
    //   UPDATE scheduler 
    //   SET 
    //     location_id = $1,
    //     incharge_id = $2,
    //     from_date = $3,
    //     to_date = $4,
    //     from_time = $5,
    //     to_time = $6,
    //     extended_hours = $8,
    //     updated_at = NOW()
    //   WHERE id = $7
    //   RETURNING *;
    // `;

    const query = `
  UPDATE scheduler 
  SET 
    incharge_id = $1,
    from_date = $2,
    to_date = $3,
    from_time = $4,
    to_time = $5,
    extended_hours = $7,
    updated_at = NOW()
  WHERE id = $6
  RETURNING *;
`;

    const values = [
      incharge_id,
      new Date(from_date),
      new Date(to_date),
      from_time,
      to_time,
      id,
      extended_hours
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

    try {
      await prisma.scheduler.delete({
        where: {
          id: id,
        },
      });

      return generateRes({ deleted: id });
    } catch (error) {
      return { error: "Internal Server Error" };
    }
  };

  async getScheduleIncharge(req: Request) {
    const { incharge_id, incharge_name, search } = req.query;
    const limit: number = Number(req.query.limit) || 10;
    const page: number = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const { ulb_id } = req.body.auth

    // const qr_func = (extend?: string) => {
    //   return `
    //     SELECT scheduler.*, pa.address, pk.cunique_id, pk.first_name, pk.middle_name, pk.last_name 
    //     FROM scheduler
    //     JOIN parking_incharge AS pk ON scheduler.incharge_id = pk.cunique_id
    //     JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
    //     ${extend ? extend : ""}
    //     LIMIT ${limit} OFFSET ${offset}
    //   `;
    // };
    const qr_func = (extend?: string) => {
      return `
       SELECT DISTINCT ON (scheduler.id) scheduler.*, pa.address, pk.first_name, pk.middle_name, pk.last_name 
        FROM scheduler
        JOIN parking_incharge AS pk ON pk.cunique_id = ANY(scheduler.incharge_id::TEXT[])
        JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
        ${extend ? extend : ""}
        group by scheduler.id, pa.address, pk.cunique_id, pk.first_name, pk.middle_name, pk.last_name 
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
      SELECT DISTINCT ON (scheduler.id) COUNT(*) FROM scheduler 
      JOIN parking_incharge AS pk ON pk.cunique_id = ANY(scheduler.incharge_id::TEXT[])
      JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
      where scheduler.ulb_id = ${ulb_id}
      group by scheduler.id
      ${searchConditions};
    `;
    // -------------------  FILTER -------------------//

    try {
      const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
      const totalItems = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      const conditionRegex = /(group by|LIMIT|OFFSET)/i;
      const data = 'where';
      const whereRegex = new RegExp(`\\b${data}\\b`, 'i');

      // First, check if WHERE clause exists
      if (whereRegex.test(qr)) {
        // If WHERE exists, insert ulb_id before JOIN, ORDER BY, LIMIT, or OFFSET
        qr = qr.replace(conditionRegex, `AND scheduler.ulb_id = '${ulb_id}' $1`);
      } else {
        // If WHERE does not exist, insert WHERE ulb_id before JOIN, ORDER BY, LIMIT, or OFFSET
        if (conditionRegex.test(qr)) {
          // If there is a JOIN, ORDER BY, LIMIT, or OFFSET, insert WHERE ulb_id before them
          qr = qr.replace(conditionRegex, `WHERE scheduler.ulb_id = '${ulb_id}' $1`);
        } else {
          // If no JOIN, ORDER BY, LIMIT, or OFFSET, just append WHERE ulb_id
          qr += ` WHERE scheduler.ulb_id = '${ulb_id}'`;
        }
      }

      // console.log(qr);

      const dataResult = await prisma.$queryRawUnsafe<any[]>(qr);

      await Promise.all(
        dataResult.map(async (item) => {
          await Promise.all(
            item?.incharge_id.map(async (id: any) => {
              const incharge = await prisma.parking_incharge.findFirst({
                where: {
                  cunique_id: id
                },
                select: {
                  first_name: true,
                  middle_name: true,
                  last_name: true
                }
              })
              Array.isArray(item.first_name) ? item.first_name.push(incharge?.first_name) : item.first_name = [incharge?.first_name]
              Array.isArray(item.middle_name) ? item.middle_name.push(incharge?.middle_name) : item.middle_name = [incharge?.middle_name]
              Array.isArray(item.last_name) ? item.last_name.push(incharge?.last_name) : item.last_name = [incharge?.last_name]
            })
          )
        })
      )

      // console.log("qr", qr);

      // console.log("dataResult", dataResult);
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

  // async getScheduleIncharge(req: Request) {
  //   const { incharge_id, incharge_name, search } = req.query;
  //   const limit: number = Number(req.query.limit) || 10;
  //   const page: number = Number(req.query.page) || 1;
  //   const offset = (page - 1) * limit;

  //   // const qr_func = (extend?: string) => {
  //   //   return `
  //   //     SELECT scheduler.*, pa.address, pk.cunique_id, pk.first_name, pk.middle_name, pk.last_name 
  //   //     FROM scheduler
  //   //     JOIN parking_incharge AS pk ON scheduler.incharge_id = pk.cunique_id
  //   //     JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
  //   //     ${extend ? extend : ""}
  //   //     LIMIT ${limit} OFFSET ${offset}
  //   //   `;
  //   // };
  //   const qr_func = (extend?: string) => {
  //     return `
  //      SELECT scheduler.*, pa.address, pk.cunique_id, pk.first_name, pk.middle_name, pk.last_name 
  //       FROM scheduler
  //       JOIN parking_incharge AS pk ON pk.cunique_id = ANY(scheduler.incharge_id::TEXT[])
  //       JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
  //       ${extend ? extend : ""}
  //       LIMIT ${limit} OFFSET ${offset}
  //     `;
  //   };

  //   let qr = qr_func();

  //   let searchConditions = "";

  //   // ------------------  FILTER ------------------//

  //   if (search && search !== "") {
  //     qr = qr_func(`
  //       WHERE 
  //       pk.first_name ILIKE '%${search}%' 
  //       OR CAST(scheduler.incharge_id AS TEXT) ILIKE '%${search}%'
  //     `);
  //   } else if (
  //     (incharge_id && incharge_id !== "") ||
  //     (incharge_name && incharge_name !== "")
  //   ) {
  //     const condition: string[] = [];

  //     if (incharge_id) {
  //       condition.push(`scheduler.incharge_id ILIKE '${incharge_id}'`);
  //     }

  //     if (incharge_name) {
  //       condition.push(`pk.first_name ILIKE '${incharge_name}'`);
  //     }

  //     searchConditions = `WHERE ${condition.join(" AND ")}`;

  //     qr = qr_func(searchConditions);
  //   }

  //   const countQuery = `
  //     SELECT COUNT(*) FROM scheduler 
  //     JOIN parking_incharge AS pk ON scheduler.incharge_id = pk.cunique_id
  //     JOIN parking_area AS pa ON scheduler.location_id::INT = pa.id
  //     ${searchConditions};
  //   `;
  //   // -------------------  FILTER -------------------//

  //   try {
  //     const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
  //     const totalItems = parseInt(countResult[0].count);
  //     const totalPages = Math.ceil(totalItems / limit);

  //     // console.log(qr);

  //     const dataResult = await prisma.$queryRawUnsafe<any[]>(qr);

  //     // console.log("qr", qr);

  //     // console.log("dataResult", dataResult);
  //     return generateRes({
  //       page,
  //       totalItems,
  //       totalPages,
  //       data: dataResult,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching schedule incharge data: ", error);
  //     return { error: "Internal Server Error" };
  //   }
  // }

  getAreaScheduleIncharge = async (req: Request) => {
    const { incharge_id, from_date, to_date } = req.body;
    const { ulb_id } = req.body.auth

    // const query: string = `
    //   select scheduler.*, parking_area.* from scheduler
    // 	where ulb_id=${ulb_id} and incharge_id = '${incharge_id}' AND '${from_date}' between from_date and to_date 
    //   or '${to_date}' between from_date and to_date
    //   join parking_area on scheduler.location_id::INT = parking_area.id
    // `;
    const query: string = `
	    select scheduler.*, parking_area.* from scheduler
      join parking_area on scheduler.location_id::INT = parking_area.id
    	where scheduler.ulb_id=${ulb_id} and '${incharge_id}' = ANY(incharge_id) AND '${from_date}' between from_date and to_date 
      or '${to_date}' between from_date and to_date;
    `;

    const data = await prisma.$queryRawUnsafe<any[]>(query);
    // console.log(data);
    return generateRes(data);
  };
}

export default ScheduleInchargeDao;

/*
 */
