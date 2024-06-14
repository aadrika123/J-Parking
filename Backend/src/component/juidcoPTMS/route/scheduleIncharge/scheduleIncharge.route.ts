import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
import ScheduleInchargeController from "../../controller/scheduleIncarge/scheduleIncharge.controller";

export default class ScheduleInchargeRoute {
  constructor(app: express.Application) {
    const scheduleInchargeController = new ScheduleInchargeController();
    this.init(app, scheduleInchargeController);
  }

  init(
    app: express.Application,
    scheduleInchargeController: ScheduleInchargeController
  ): void {
    app
      .route(`${baseUrl}/get-details-location`)
      .post((req: Request, res: Response) =>
        scheduleInchargeController.getDetailsByLocation(req, res, "0301")
      );

    app
      .route(`${baseUrl}/create-schedule`)
      .post((req: Request, res: Response) =>
        scheduleInchargeController.createScheduleIncharge(req, res, "0302")
      );

    app
      .route(`${baseUrl}/get-schedule`)
      .get((req: Request, res: Response) =>
        scheduleInchargeController.getScheduleIncharge(req, res, "0303")
      );

    app
      .route(`${baseUrl}/update-schedule`)
      .post((req: Request, res: Response) =>
        scheduleInchargeController.updateSchedulerIncharge(req, res, "0304")
      );

    app
      .route(`${baseUrl}/delete-schedule`)
      .post((req: Request, res: Response) =>
        scheduleInchargeController.deleteScheduler(req, res, "0305")
      );

      app
      .route(`${baseUrl}/get-schedule-incharge`)
      .post((req: Request, res: Response) =>
        scheduleInchargeController.getAreaScheduleIncharge(req, res, "0306")
      );
  }
}
