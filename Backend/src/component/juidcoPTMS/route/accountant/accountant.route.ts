import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
import AccController from "../../controller/accountant/accountant.controller";
export default class AccountantRoute {
  constructor(app: express.Application) {
    const accController = new AccController();
    this.init(app, accController);
  }

  init(
    app: express.Application,
    accController: AccController
  ): void {

    app
      .route(`${baseUrl}/summary`)
      .get((req: Request, res: Response) =>
        accController.getAccSummaryList(req, res, "0701")
      );

    app
      .route(`${baseUrl}/summary/verify`)
      .post((req: Request, res: Response) =>
        accController.verify(req, res, "0702")
      );

    app
      .route(`${baseUrl}/summary/:transaction_id`)
      .get((req: Request, res: Response) =>
        accController.getAccSummaryDetails(req, res, "0703")
      );

  }
}
