import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
// import BusGenerateReportServices from "../../controller/reportGeneration/busReport.services";
import ReportController from "../../controller/report/report.controller";
import InchargeReportController from "../../controller/inchargeReport/inchargeReport.controller";

export default class ReportRoute {
  constructor(app: express.Application) {
    // const busGenerateReportServices = new BusGenerateReportServices();
    const reportController = new ReportController();
    // this.init(app, busGenerateReportServices);
    this.init(app, reportController);
  }

  init(
    app: express.Application,
    // busGenerateReportServices: BusGenerateReportServices
    reportGeneration: ReportController
  ): void {
    app
      .route(`${baseUrl}/report-daywise`)
      .post((req: Request, res: Response) =>
        reportGeneration.get(req, res, "0501")
      );

    app
      .route(`${baseUrl}/report-daywise/total`)
      .post((req: Request, res: Response) =>
        reportGeneration.getTotalAmount(req, res, "0502")
      );

    app
      .route(`${baseUrl}/report/real-time`)
      .get((req: Request, res: Response) =>
        reportGeneration.getRealTimeCollection(req, res, "0503")
      );

    app
      .route(`${baseUrl}/report/collection`)
      .post((req: Request, res: Response) =>
        reportGeneration.getCollections(req, res, "0504")
      );

    app
      .route(`${baseUrl}/report/incharge-daywise`)
      .post((req: Request, res: Response) =>
        InchargeReportController.report(req, res, "0505")
      );

    app
      .route(`${baseUrl}/report/weekly-collection`)
      .post((req: Request, res: Response) =>
        reportGeneration.getWeeklyCollection(req, res, "0506")
      );

    app
      .route(`${baseUrl}/report/vehicle-collection`)
      .post((req: Request, res: Response) =>
        reportGeneration.getVehicleCollection(req, res, "0507")
      );

    app
      .route(`${baseUrl}/report/vehicle-count`)
      .post((req: Request, res: Response) =>
        reportGeneration.getVehicleCount(req, res, "0508")
      );

    app
      .route(`${baseUrl}/report/hourly-real-time`)
      .get((req: Request, res: Response) =>
        reportGeneration.getHourlyRealtimeData(req, res, "0507")
      );

    app
      .route(`${baseUrl}/report/incharge-report`)
      .post((req: Request, res: Response) =>
        InchargeReportController.inchargeReport(req, res, "05051")
      );

    app
      .route(`${baseUrl}/report/all`)
      .post((req: Request, res: Response) =>
        reportGeneration.generateAllReports(req, res, "05000")
      );

    app
      .route(`${baseUrl}/report/statistics`)
      .post((req: Request, res: Response) =>
        reportGeneration.statistics(req, res, "05002")
      );
    app
      .route(`${baseUrl}/report/monthly`)
      .get((req: Request, res: Response) =>
        reportGeneration.getMonthlyCollection(req, res, "05003")
      );

    app
      .route(`${baseUrl}/report/yearly`)
      .get((req: Request, res: Response) =>
        reportGeneration.getYearlyCollection(req, res, "05002")
      );

  }
}
