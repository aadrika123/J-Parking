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
      .route(`${baseUrl}/receipt-generate`)
      .post((req: Request, res: Response) => receipt.post(req, res, "0501"));
  }
}