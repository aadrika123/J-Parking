import { Request, Response } from "express";

import ReceiptDao from "../../dao/receipt/receipt.dao";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";

export default class ReceiptController {
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
          error: "failed to generate ticket!",
        });
      }

      return res.json({
        message: "Ticket Generated Successfully!",
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };
}
