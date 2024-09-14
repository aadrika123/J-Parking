import express, { Request, Response } from "express";
import { baseUrl } from "../../../../util/common";
import UserController from "../../controller/user/user.controller";
export default class UserRoute {
  constructor(app: express.Application) {
    const userController = new UserController();
    this.init(app, userController);
  }

  init(
    app: express.Application,
    userController: UserController
  ): void {
    app
      .route(`${baseUrl}/user`)
      .get((req: Request, res: Response) =>
        userController.getUser(req, res, "0602")
      );

    app
      .route(`${baseUrl}/user/get-ulb`)
      .get((req: Request, res: Response) =>
        userController.getUlbData(req, res, "0602")
      );

  }
}
