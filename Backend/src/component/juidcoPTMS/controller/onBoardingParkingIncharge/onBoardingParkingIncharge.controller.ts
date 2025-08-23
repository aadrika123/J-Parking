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

  async updateStatusById(req: Request, res: Response, apiId: string) {
  const resObj: resObj = {
    apiId,
    action: "POST",
    version: "1.0",
  };

  try {
    const id = Number(req.query.id);
    if (isNaN(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID",
      });
    }

    let { is_approved, is_active } = req.body;

    // Parse string values to boolean if needed
    if (typeof is_approved === "string") {
      is_approved = is_approved === "true";
    }
    if (typeof is_active === "string") {
      is_active = is_active === "true";
    }

    // At least one valid boolean is required
    if (typeof is_approved !== "boolean" && typeof is_active !== "boolean") {
      return res.status(400).json({
        status: false,
        message:
          "At least one of 'is_approved' or 'is_active' must be a boolean value",
      });
    }

    const updateData: { is_approved?: boolean; is_active?: boolean } = {};
    if (typeof is_approved === "boolean") updateData.is_approved = is_approved;
    if (typeof is_active === "boolean") updateData.is_active = is_active;

    const data: any = await this.parkingInchargeDao.updateStatusById(id, updateData);

    if (data?.status === "ERROR") {
      return CommonRes.SERVER_ERROR(data.detail, resObj, res);
    }

    return CommonRes.SUCCESS(
      "Parking Incharge status updated successfully",
      data,
      resObj,
      res
    );
  } catch (error: any) {
    return CommonRes.SERVER_ERROR(error.message, resObj, res);
  }
}

async getApprovedIncharges(req: Request, res: Response, apiId: string) {
  const resObj: resObj = {
    apiId,
    action: "GET",
    version: "1.0",
  };

  try {
    const data = await this.parkingInchargeDao.getApprovedIncharges(req);

    if (data?.status === "ERROR") {
      return CommonRes.SERVER_ERROR(data.detail, resObj, res);
    }

    return CommonRes.SUCCESS("Approved Incharges fetched successfully", data, resObj, res);
  } catch (error: any) {
    return CommonRes.SERVER_ERROR(error.message, resObj, res);
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
