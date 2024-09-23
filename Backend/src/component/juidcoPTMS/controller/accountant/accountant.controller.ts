/**
 * Author: Anil Tigga
 * status: Open
 */

import { Request, Response } from "express";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";
import AccountantDao from "../../dao/accountant/accountant.dao";

class AccountantController {
  private accDao: AccountantDao;

  constructor() {
    this.accDao = new AccountantDao();
  }
  async getAccSummaryList(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.accDao.getAccSummaryList(req);

      return CommonRes.SUCCESS("Summary list fetched Successfully", data, resObj, res);
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }


}
export default AccountantController;
