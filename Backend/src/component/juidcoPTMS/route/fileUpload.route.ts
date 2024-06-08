import express, { Request, Response } from "express";
import { baseUrl } from "../../../util/common";
import UploadImgServices from "../controller/common/uploadImg.services";
import { upload } from "../../../middleware/fileUpload.middleware";

export default class FileUploadRoute {
  constructor(app: express.Application) {
    const uploadImg = new UploadImgServices();
    this.init(app, uploadImg);
  }
  init(app: express.Application, uploadImg: UploadImgServices): void {
    app
      .route(`${baseUrl}/file-upload`)
      .post(upload.array("file"), (req: Request, res: Response) =>
        uploadImg.imageUpload(req, res)
      );
  }
}
