/**
 * Author: Anil Tigga
 * status: Open
 */

import { Request, Response } from "express";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";
import UserDao from "../../dao/user/user.dao";

class UserController {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }
  async getUser(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.userDao.getUser(req);

      return CommonRes.SUCCESS("User fetched Successfully", data, resObj, res);
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async getUlbData(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.userDao.getUlbData(req);
      res.json(data?.data[0])
      // return CommonRes.SUCCESS("ULB data fetched Successfully", data, resObj, res);
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

}
export default UserController;
