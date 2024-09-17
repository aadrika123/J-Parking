import { Request, Response } from "express";

import ReceiptDao from "../../dao/receipt/receipt.dao";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";

export default class ReceiptController {
  getAreaAmount = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.getAreaAmount(req);

      if (!data) {
        return res.json({
          error: "failed to Get Area Amount!",
        });
      }

      return res.json({
        message: "Area Amount Found Successfully!",
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  post = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.post(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to generate ticket!",
        });
      }

      return res.json({
        success: true,
        message: "Ticket Generated Successfully!",
        data: data,
      });
    } catch (error: any) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  get = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.get(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to Get ticket!",
        });
      }

      return res.json({
        success: true,
        message: "Ticket Found Successfully!",
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  createReceipt = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.createReceipt(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to generate ticket!",
        });
      }

      return res.json({
        success: true,
        message: "Ticket Generated Successfully!",
        data: data,
      });
    } catch (error: any) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  calculateAmount = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.calculateAmount(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to calculate amount!",
        });
      }

      return res.json({
        success: true,
        message: "Amount calculated Successfully!",
        data: data,
      });
    } catch (error: any) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  createReceiptOut = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.createReceiptOut(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to generate ticket!",
        });
      }

      return res.json({
        success: true,
        message: "Ticket Generated Successfully!",
        data: data,
      });
    } catch (error: any) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getReceipt = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.getReceipt(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to Get ticket!",
        });
      }

      return res.json({
        success: true,
        message: "Ticket Found Successfully!",
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getInVehicle = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await ReceiptDao.getInVehicle(req);

      if (!data) {
        return res.json({
          success: false,
          error: "failed to Get details!",
        });
      }

      return res.json({
        success: true,
        message: "Details Found Successfully!",
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

}
