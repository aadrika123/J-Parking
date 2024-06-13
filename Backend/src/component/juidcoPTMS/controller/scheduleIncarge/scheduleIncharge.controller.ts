/**
 * Author: Krish Vishwakarma
 * status: Open
 *  Use: Manage Parking Incharge
 */

import { Request, Response } from "express";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";
import ScheduleInchargeDao from "../../dao/scheduleIncharge/scheduleIncharge.dao";

class ScheduleInchargeController {
  private scheduleIncharge: ScheduleInchargeDao;

  constructor() {
    this.scheduleIncharge = new ScheduleInchargeDao();
  }
  async getDetailsByLocation(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.scheduleIncharge.getDetailsByLocation(req);
      console.log("i",data);
      return res.json({
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async createScheduleIncharge(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.scheduleIncharge.createScheduleIncharge(req);
      console.log(data)
      if (!data) {
        return CommonRes.NOT_FOUND("Not Found", data, resObj, res);
      }

      return res.json({
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async updateSchedulerIncharge(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.scheduleIncharge.updateSchedulerIncharge(req);

      return res.json({
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async deleteScheduler(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.scheduleIncharge.deleteScheduler(req);

      return res.json({
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async getScheduleIncharge(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.scheduleIncharge.getScheduleIncharge(req);

      return res.json({
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }
}
export default ScheduleInchargeController;
