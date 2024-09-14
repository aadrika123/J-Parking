/**
 * Author: Anil Tigga
 * status: Open
 */

import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class UserDao {
  async getUser(req: Request) {
    const user = req?.body?.auth
    return generateRes(user);
  }

  getUlbData = async (req: Request) => {
    const { auth } = req.body;

    const [data] = await prisma.$transaction([prisma.$queryRawUnsafe(`select id::INT,ulb_name from ulb_masters where id=${auth?.ulb_id}`)]);

    return generateRes(data);
  };

}

export default UserDao;
