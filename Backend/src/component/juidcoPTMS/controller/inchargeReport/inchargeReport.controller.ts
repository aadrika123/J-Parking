import { Request, Response } from "express";

import InchargeReportDao from "../../dao/inchargeReport/inchargeReport.dao";
import CommonRes from "../../../../util/helper/commonResponse";
import { resObj } from "../../../../util/types";

export default class InchargeReportController {
  static report = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await InchargeReportDao.report(req);

      if (!data) {
        return res.json({
          success: false,
          error: "No data found",
          data: data
        });
      }

      return res.json({
        success: true,
        message: "Report Generated Successfully!",
        data: data,
      });
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };
}
