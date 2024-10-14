import { Request, Response } from "express";
import CommonRes from "../../../../util/helper/commonResponse";
import ReportDao from "../../dao/report/report.dao";
import { resMessage } from "../../../../util/common";
import { resObj } from "../../../../util/types";

class ReportController {
  private reportDao: ReportDao;
  private initMsg: string;
  constructor() {
    this.reportDao = new ReportDao();
    this.initMsg = "Report";
  }

  get = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.generateReport(req);
      if (!data) {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getTotalAmount = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getTotalAmount(req);
      if (!data) {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getRealTimeCollection = async (
    req: Request,
    res: Response,
    apiId: string
  ) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getRealTimeCollection(req);
      if (data === "null") {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getCollections = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "GET",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getCollections(req);
      if (data === "null") {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getWeeklyCollection = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getWeeklyCollection(req);
      if (data === "null") {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getVehicleCollection = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getVehicleCollection(req);
      if (data === "null") {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getVehicleCount = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getVehicleCount(req);
      if (data === "null") {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  getHourlyRealtimeData = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.getHourlyRealtimeData(req);
      // if (data === "null") {
      //   return CommonRes.NOT_FOUND(
      //     resMessage(this.initMsg).NOT_FOUND,
      //     data,
      //     resObj,
      //     res
      //   );
      // }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

  generateAllReports = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const data = await this.reportDao.generateAllReports(req);
      if (data === "null") {
        return CommonRes.NOT_FOUND(
          resMessage(this.initMsg).NOT_FOUND,
          data,
          resObj,
          res
        );
      }

      return CommonRes.SUCCESS(
        resMessage(this.initMsg).FOUND,
        data,
        resObj,
        res
      );
    } catch (error) {
      return CommonRes.SERVER_ERROR(error, resObj, res);
    }
  };

}

export default ReportController;
