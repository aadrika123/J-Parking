import { Request, Response } from "express";

import UploadFileDao from "../../dao/uploadFile/uploadFile.dao";

export default class UploadImgServices {
  imageUpload = async (req: Request, res: Response) => {
    try {
      const file = await UploadFileDao.upload(req);

      if (!file) {
        return res.json({
          error: "failed to upload file!",
        });
      }

      return res.json({
        message: "file uploaded!",
        data: file,
      });
    } catch (error) {
      return res.json({ error: "Internal Server Error" });
    }
  };
}
