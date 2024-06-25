import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { generateRes } from "../../../../util/generateRes";
import { getCurrentWeekRange } from "../../../../util/helper";

const prisma = new PrismaClient();
class ReportDao {
  generateReport = async (req: Request) => {
    const { incharge_id, area_id, from_date, to_date } = req.body;
    let amounts: any = [];
    let query: string = "";
    const conductor: string = ", receipts.incharge_id ";

    function query_fn(
      extend_query: string,
      incharge?: string,
      monthlyWise?: boolean
    ): string {
      return `
      select area_id, sum(amount)::INT as total_collection , ${
        !monthlyWise ? "EXTRACT (MONTH FROM date) as month" : "date"
      } , receipts.incharge_id ${incharge || ""} from receipts 
        LEFT JOIN parking_area as bm ON receipts.area_id = bm.id
        LEFT JOIN parking_incharge as cm ON receipts.incharge_id = cm.cunique_id
        ${extend_query} group by area_id, ${
        !monthlyWise ? "EXTRACT (MONTH FROM date)" : "date"
      }, receipts.incharge_id
         ${incharge || ""} order by ${
        !monthlyWise ? "EXTRACT (MONTH FROM date)" : "date"
      } ASC
      `;
    }

    query = query_fn("");

    if (incharge_id) {
      const query_extend = `where receipts.incharge_id = '${incharge_id}' `;
      query = query_fn(query_extend, conductor);

      amounts = await prisma.$queryRawUnsafe(`
        select area_id, incharge_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts 
        group by area_id, incharge_id, amount, date
      `);
    }

    if (area_id) {
      const query_extend = `where receipts.area_id = '${area_id}' `;
      query = query_fn(query_extend);

      amounts = await prisma.$queryRawUnsafe(`
        select area_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts 
        where area_id = '${area_id}'
        group by area_id, amount, date
      `);
    }

    // ======================== BY INCHARGE ================================//
    if (from_date && incharge_id) {
      const query_extend = `where receipts.incharge_id = '${incharge_id}' AND date::text = '${from_date}'`;
      query = query_fn(query_extend, conductor);

      amounts = await prisma.$queryRawUnsafe(`
        select area_id, incharge_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts 
        group by incharge_id, amount, date, area_id
        having date = '${from_date}'`);
    }

    if (from_date && to_date && incharge_id) {
      const query_extend = `where date::text between '${from_date}' and '${to_date}'
                            AND receipts.incharge_id = '${incharge_id}'`;
      query = query_fn(query_extend, conductor);

      amounts = await prisma.$queryRawUnsafe(`
        select area_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts
        WHERE incharge_id = '${incharge_id}' AND date BETWEEN '${from_date}' AND '${to_date}'
        group by area_id, amount, date
        ORDER BY date ASC`);
    }

    // if (month && incharge_id) {
    //   const query_extend = `where receipts.incharge_id = '${incharge_id}' AND date::text = '${from_date}'`;
    //   query = query_fn(query_extend, conductor, true);

    //   amounts = await prisma.$queryRawUnsafe(`
    //     select area_id, incharge_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts
    //     group by incharge_id, amount, date, area_id
    //     having date = '${from_date}'`);
    // }

    // ======================== BY INCHARGE ================================//

    // ======================== BY AREA ================================//
    if (from_date && area_id) {
      const query_extend = `where receipts.area_id = '${area_id}' AND date::text = '${from_date}'`;
      query = query_fn(query_extend);

      amounts = await prisma.$queryRawUnsafe(`
        select area_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts 
        where area_id = '${area_id}'
        group by area_id, amount, date
        having date = '${from_date}'`);
    }

    if (from_date && to_date && area_id) {
      const query_extend = `where date::text between '${from_date}' and '${to_date}'
                            AND receipts.area_id = '${area_id}'`;
      query = query_fn(query_extend);
      amounts = await prisma.$queryRawUnsafe(`
        select area_id,amount::INT, count(amount)::INT, sum(amount)::INT,date::DATE from receipts
        WHERE area_id = '${area_id}' AND date BETWEEN '${from_date}' AND '${to_date}'
        group by area_id, amount, date
        ORDER BY date ASC`);
    }
    // ======================== BY AREA ================================//

    const [data] = await prisma.$transaction([
      prisma.$queryRawUnsafe<any[]>(`${query}`),
    ]);

    const result = {
      data: [...data],
      amounts,
    };
    return generateRes({ result });
  };

  getTotalAmount = async (req: Request) => {
    const { area_id, incharge_id, from_date, to_date, curr_date } = req.body;
    let query: string = "";
    function query_fn(extend_query: string): string {
      return `
        select sum(amount)::INT as total_collection from receipts ${extend_query}
      `;
    }

    query = query_fn("");

    //   ------------------------- FILTER BY AREA -----------------------------//
    if (area_id) {
      query = query_fn(`where area_id = '${area_id}'`);
    }

    if (area_id && from_date) {
      query = query_fn(
        `WHERE area_id = '${area_id}' AND date = '${from_date}'`
      );
    }
    if (area_id && from_date && to_date) {
      query = query_fn(
        `where area_id = '${area_id}' AND date BETWEEN '${from_date}' AND '${to_date}'`
      );
    }
    //   ------------------------- FILTER BY AREA -----------------------------//

    //   ------------------------- FILTER BY INCHARGE -----------------------------//
    if (incharge_id) {
      query = query_fn(`where incharge_id = '${incharge_id}'`);
    }
    if (incharge_id && from_date) {
      query = query_fn(
        ` where incharge_id = '${incharge_id}' AND date = '${from_date}'`
      );
    }
    if (incharge_id && from_date && to_date) {
      query = query_fn(
        `where incharge_id = '${incharge_id}' AND date BETWEEN '${from_date}' AND '${to_date}'`
      );
    }
    //   ------------------------- FILTER BY INCHARGE-----------------------------//

    //   ------------------------- FILTER BY CURRENT_DATE TOTAL COLLECTION-----------------------------//
    if (curr_date) {
      query = query_fn(`where date = '${curr_date}'`);
    }
    //   ------------------------- FILTER BY CURRENT_DATE TOTAL COLLECTION-----------------------------//
    const data = await prisma.$queryRawUnsafe(`${query}`);

    return generateRes(data);
  };

  //   ------------------------- GET REAL-TIME COLLECTION ----------------------------//

  getRealTimeCollection = async () => {
    const date = new Date().toISOString().split("T")[0];
    const qr_real_time = `
          SELECT SUM (amount)::INT, extract (HOUR from created_at) as "from" , extract (HOUR from created_at)+1 as "to"  FROM receipts 
        	where date = '${date}'
        	group by (extract (HOUR from created_at))  
        `;
    const data = await prisma.$queryRawUnsafe(qr_real_time);
    return generateRes(data);
  };

  getCollections = async (req: Request) => {
    const { from_date, to_date, area_id } = req.body;

    function qr_func(condition?: string) {
      return `
        select count(vehicle_no)::INT, sum(amount)::INT, date from receipts
        ${condition || ""}
        group by vehicle_no, date
      `;
    }

    function qr_func_2(condition?: string) {
      return `
        select incharge_id, SUM (amount)::INT, pi.* from receipts
        join parking_incharge as pi on receipts.incharge_id = pi.cunique_id
        ${condition || ""}
        group by incharge_id, pi.id
      `;
    }

    let qr_1 = qr_func(`where area_id = ${area_id}`);
    let qr_2 = qr_func(
      `where vehicle_type = 'two_wheeler' and area_id = ${area_id}`
    );
    let qr_3 = qr_func(
      `where vehicle_type = 'four_wheeler' and area_id = ${area_id}`
    );
    const qr_4 = `
      select * from parking_area where id = ${area_id}
    `;

    let qr_5 = qr_func_2(`where area_id = ${area_id}`);

    if (from_date && to_date) {
      qr_1 = qr_func(`
        where date between '${from_date}' and '${to_date}' and area_id = ${area_id}
      `);

      qr_2 = qr_func(`
        where date between '${from_date}' and '${to_date}' and vehicle_type = 'two_wheeler' and area_id = ${area_id}
      `);

      qr_3 = qr_func(`
        where date between '${from_date}' and '${to_date}' and vehicle_type = 'four_wheeler' and area_id = ${area_id}
      `);

      qr_5 = qr_func_2(`
        where date between '${from_date}' and '${to_date}' and area_id = ${area_id}
      `);
    }

    const [data1, data2, data3, data4, data5] = await prisma.$transaction([
      prisma.$queryRawUnsafe(qr_1),
      prisma.$queryRawUnsafe(qr_2),
      prisma.$queryRawUnsafe(qr_3),
      prisma.$queryRawUnsafe(qr_4),
      prisma.$queryRawUnsafe(qr_5),
    ]);

    const data = {
      all: data1,
      two_wheeler: data2,
      four_wheeler: data3,
      location_info: data4,
      incharge: data5,
    };

    return generateRes(data);
  };

  getWeeklyCollection = async (req: Request) => {
    const { from_date, to_date } = req.body;

    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    const qr_func = (condition?: string) => {
      return `
        SELECT
          COUNT(vehicle_no)::INT AS vehicle_count,
          SUM(amount)::INT AS total_amount,
          pa.type_parking_space,
          incharge_id,
          date
        FROM receipts
        join parking_area as pa on receipts.area_id = pa.id
        ${condition || `where date between '${startOfWeek}' and '${endOfWeek}'`}
        GROUP BY
          date,
          incharge_id,
          pa.type_parking_space
        ORDER BY
          date, incharge_id;
      `;
    };

    let qr_1 = qr_func(`where pa.type_parking_space = 'UnOrganized'`);
    let qr_2 = qr_func(`where pa.type_parking_space = 'Organized'`);

    if (from_date && to_date) {
      qr_1 = qr_func(`
        where date between '${from_date}' and '${to_date}' and pa.type_parking_space = 'UnOrganized'
      `);

      qr_2 = qr_func(`
        where date between '${from_date}' and '${to_date}' and pa.type_parking_space = 'Organized'
      `);
    }

    const [data1, data2] = await prisma.$transaction([
      prisma.$queryRawUnsafe(qr_1),
      prisma.$queryRawUnsafe(qr_2),
    ]);

    const data = {
      UnOrganized: data1,
      Organized: data2,
    };
    return generateRes(data);
  };

  getVehicleCollection = async (req: Request) => {
    const { from_date, to_date } = req.body;

    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    const qr_func = (condition?: string) => {
      return `
         SELECT
          COUNT(vehicle_no)::INT as vehicle_count,
            SUM(amount)::INT AS total_amount,
            date
            FROM receipts 
         ${
           condition || `where date between '${startOfWeek}' and '${endOfWeek}'`
         }
            GROUP BY
              date
            ORDER BY
              date;
      `;
    };

    let qr_1 = qr_func(`where vehicle_type = 'two_wheeler'`);
    let qr_2 = qr_func(`where vehicle_type = 'four_wheeler'`);

    if (from_date && to_date) {
      qr_1 = qr_func(`
        where date between '${from_date}' and '${to_date}' and vehicle_type = 'two_wheeler'
      `);

      qr_2 = qr_func(`
        where date between '${from_date}' and '${to_date}' and vehicle_type = 'four_wheeler'
      `);
    }
    const [data1, data2] = await prisma.$transaction([
      prisma.$queryRawUnsafe(qr_1),
      prisma.$queryRawUnsafe(qr_2),
    ]);

    const data = {
      two_wheeler: data1,
      four_wheeler: data2,
    };

    return generateRes(data);
  };

  getVehicleCount = async (req: Request) => {
    const { from_date, to_date } = req.body;

    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    const qr_func = (condition?: string) => {
      return `
        	SELECT
            COUNT(vehicle_no)::INT AS vehicle_count,
            SUM(amount)::INT AS total_amount,
            date
          FROM receipts
         ${
           condition || `where date between '${startOfWeek}' and '${endOfWeek}'`
         } group by date
		
      `;
    };

    let qr_1 = qr_func(`where vehicle_type = 'two_wheeler'`);
    let qr_2 = qr_func(`where vehicle_type = 'four_wheeler'`);

    if (from_date && to_date) {
      qr_1 = qr_func(`
        where date between '${from_date}' and '${to_date}' and vehicle_type = 'two_wheeler'
      `);

      qr_2 = qr_func(`
        where date between '${from_date}' and '${to_date}' and vehicle_type = 'four_wheeler'
      `);
    }

    const [data1, data2] = await prisma.$transaction([
      prisma.$queryRawUnsafe(qr_1),
      prisma.$queryRawUnsafe(qr_2),
    ]);

    const data = {
      two_wheeler: data1,
      four_wheeler: data2,
    };

    return generateRes(data);
  };

  //   ------------------------- GET REAL-TIME COLLECTION ----------------------------//
}

export default ReportDao;