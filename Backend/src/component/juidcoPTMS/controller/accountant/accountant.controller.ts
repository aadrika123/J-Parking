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

  async getAccSummaryDetails(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };
    try {
      const data = await this.accDao.getAccSummaryDetails(req);
      return CommonRes.SUCCESS("Summary details fetched Successfully", data, resObj, res);
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async verify(req: Request, res: Response, apiId: string) {
    const { transaction_id }: { transaction_id: string[] } = req.body
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };
    try {
      const dataToReturn: any[] = []
      if (transaction_id.length !== 0) {
        await Promise.all(
          transaction_id?.map(async (item) => {
            const data = await this.accDao.verify(item);
            dataToReturn.push(data)
          })
        )
      }
      return CommonRes.SUCCESS("Updated Successfully", dataToReturn, resObj, res);
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async getSchedules(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };
    let date = new Date()
    try {
      if (req.query.date) {
        date = new Date(String(req.query.date))
      }
      const data = await this.accDao.getSchedules(date);
      return CommonRes.SUCCESS("Schedule list fetched Successfully", data, resObj, res);
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

}
export default AccountantController;
