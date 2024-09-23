import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
import ReceiptController from "../../controller/receipt/receipt.controller";

export default class ReceiptRoute {
  constructor(app: express.Application) {
    const receipt = new ReceiptController();
    this.init(app, receipt);
  }
  init(app: express.Application, receipt: ReceiptController): void {
    app
      .route(`${baseUrl}/receipt-create`)
      .post((req: Request, res: Response) => receipt.post(req, res, "0501"));

    app
      .route(`${baseUrl}/receipt-get`)
      .get((req: Request, res: Response) => receipt.get(req, res, "0502"));

    app
      .route(`${baseUrl}/get-area-amount`)
      .get((req: Request, res: Response) => receipt.getAreaAmount(req, res, "0503"));

    //new
    app
      .route(`${baseUrl}/receipt`)
      .post((req: Request, res: Response) => receipt.createReceipt(req, res, "0504"));

    app
      .route(`${baseUrl}/receipt/calculate-amount`)
      .post((req: Request, res: Response) => receipt.calculateAmount(req, res, "0505"));

    app
      .route(`${baseUrl}/receipt/out`)
      .post((req: Request, res: Response) => receipt.createReceiptOut(req, res, "0506"));

    app
      .route(`${baseUrl}/receipt/:receipt_no`)
      .get((req: Request, res: Response) => receipt.getReceipt(req, res, "0507"));

    app
      .route(`${baseUrl}/receipt/vehicle/:vehicle_no`)
      .get((req: Request, res: Response) => receipt.getInVehicle(req, res, "0508"));

    app
      .route(`${baseUrl}/receipt/calculate-amount-unorganized`)
      .post((req: Request, res: Response) => receipt.getAmountUnorganized(req, res, "0509"));

    app
      .route(`${baseUrl}/receipt/unorganized`)
      .post((req: Request, res: Response) => receipt.createReceiptUnorganized(req, res, "0509"));

    app
      .route(`${baseUrl}/receipt/submit`)
      .post((req: Request, res: Response) => receipt.submitAmount(req, res, "0510"));

    app
      .route(`${baseUrl}/receipt/get-amount/:incharge_id`)
      .get((req: Request, res: Response) => receipt.getAmount(req, res, "0511"));

  }
}
