/**
 * Author: Anil Tigga
 * status: Open
 */

import { Request } from "express";
import { generateRes } from "../../../../util/generateRes";

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

class UserDao {
  async getUser(req: Request) {
    const user = req?.body?.auth
    return generateRes(user);
  }
}

export default UserDao;
