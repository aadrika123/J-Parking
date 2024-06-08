import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
import ParkingAreaController from "../../controller/onBoardingParkingArea/onBoardingParkingArea.controller";
import { upload } from "../../../../middleware/fileUpload.middleware";
export default class OnBoardingAreaRoute {
  constructor(app: express.Application) {
    const parkingAreaController = new ParkingAreaController();
    this.init(app, parkingAreaController);
  }

  init(
    app: express.Application,
    parkingAreaController: ParkingAreaController
  ): void {
    app
      .route(`${baseUrl}/onboard-parking-area`)
      .post(upload.array("kyc"), (req: Request, res: Response) =>
        parkingAreaController.create(req, res, "0201")
      );

    app
      .route(`${baseUrl}/get-parking-area`)
      .get((req: Request, res: Response) =>
        parkingAreaController.get(req, res, "0102")
      );
  }
}
