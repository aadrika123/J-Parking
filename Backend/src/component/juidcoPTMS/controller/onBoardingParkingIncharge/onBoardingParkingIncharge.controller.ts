/**
 * Author: Krish Vishwakarma
 * status: Open
 *  Use: Manage Parking Incharge
 */

import { Request, Response } from "express";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";
import ParkingInchargeDao from "../../dao/onBoardParkingIncharge/onboardParkingIncharge.dao";

class ParkingInchargeController {
  private parkingInchargeDao: ParkingInchargeDao;

  constructor() {
    this.parkingInchargeDao = new ParkingInchargeDao();
  }
  async create(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.parkingInchargeDao.create(req);

      if (!data) {
        return res.status(200).json({
          data: data,
        });
      }

      if (data?.status === 409) {
        return res.json({
          error: data,
        });
      }

      return CommonRes.SUCCESS(
        "Incharge Added Successfully",
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  async get(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.parkingInchargeDao.get(req);

      if (data?.status === "ERROR") {
        return res.json({
          error: data.detail,
        });
      }

      if (!data) {
        return res.json({
          message: "NO DATA FOUND",
        });
      }

      return CommonRes.SUCCESS(
        "Incharge Found Successfully",
        data,
        resObj,
        res
      );
    } catch (error) {
      return res.json({ error: error });
    }
  }

  async delete(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "DELETE",
      version: "1.0",
    };

    try {
      const data = await this.parkingInchargeDao.delete(req);

      if (!data) {
        return res.json({
          error: "failed to delete Incharge!",
        });
      }

      return res.json({
        message: "Incharge Deleted Successfully!",
        data: data,
      });
    } catch (error: any) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }
}
export default ParkingInchargeController;
