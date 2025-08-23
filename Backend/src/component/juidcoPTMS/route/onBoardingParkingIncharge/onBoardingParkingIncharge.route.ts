import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
import ParkingInchargeController from "../../controller/onBoardingParkingIncharge/onBoardingParkingIncharge.controller";
export default class OnBoardingInchargeRoute {
  constructor(app: express.Application) {
    const parkingInchargeController = new ParkingInchargeController();
    this.init(app, parkingInchargeController);
  }

  init(
    app: express.Application,
    parkingInchargeController: ParkingInchargeController
  ): void {
    app
      .route(`${baseUrl}/onboard-parking-incharge`)
      .post((req: Request, res: Response) =>
        parkingInchargeController.create(req, res, "0101")
      );

    app
      .route(`${baseUrl}/get-parking-incharge`)
      .get((req: Request, res: Response) =>
        parkingInchargeController.get(req, res, "0102")
      );

    app
      .route(`${baseUrl}/update-parking-incharge`)
      .post((req: Request, res: Response) =>
        parkingInchargeController.updateStatusById(req, res, "0104")
      );
    app
      .route(`${baseUrl}/incharges/approved`)
      .get((req: Request, res: Response) =>
        parkingInchargeController.getApprovedIncharges(req, res, "0104")
      );

    app
      .route(`${baseUrl}/delete-parking-incharge`)
      .post((req: Request, res: Response) =>
        parkingInchargeController.delete(req, res, "0103")
      );
  }
}
