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

    const data: any = await prisma.$queryRaw`
    select wf_role_id from wf_roleusermaps where user_id=${user?.id}
    `

    // data[0].wf_role_id

    const roleData: any = await prisma.$queryRaw`
    select role_name from wf_roles where id=${data[0].wf_role_id}
    `

    user.role_id = data[0].wf_role_id
    user.role_name = roleData[0]?.role_name

    return generateRes(user);
  }

  getUlbData = async (req: Request) => {
    const { auth } = req.body;

    const [data] = await prisma.$transaction([prisma.$queryRawUnsafe(`select id::INT,ulb_name from ulb_masters where id=${auth?.ulb_id}`)]);

    return generateRes(data);
  };

}

export default UserDao;
