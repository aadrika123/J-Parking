/**
 * Author: Krish Vishwakarma
 * status: Open
 *  Use: Manage Parking Areas
 */

import { Request, Response } from "express";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";
import ParkingAreaDao from "../../dao/onBoardParkingArea/onboardParkingArea";

class ParkingAreaController {
  private parkingAreaDao: ParkingAreaDao;

  constructor() {
    this.parkingAreaDao = new ParkingAreaDao();
  }
  async create(req: Request, res: Response, apiId: string) {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.parkingAreaDao.create(req);

      if (data.status === "ERROR") {
        return res.json({
          error: data.detail,
        });
      }

      return CommonRes.SUCCESS("Area Added Successfully", data, resObj, res);
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
      const data = await this.parkingAreaDao.get(req);

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
        "Parkng Area Found Successfully",
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  }

  get_all_parking_area = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.parkingAreaDao.get_all_parking_area(req);

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
        "Parkng Area Found Successfully",
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  delete_parking_area = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "DELETE",
      version: "1.0",
    };

    try {
      const data = await this.parkingAreaDao.delete_parking_area(req);

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
        "Parkng Area Found Successfully",
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };
}
export default ParkingAreaController;
