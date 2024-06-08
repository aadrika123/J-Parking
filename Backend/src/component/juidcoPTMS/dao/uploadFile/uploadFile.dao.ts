import { Request } from "express";
import { imageUploader } from "../../../../lib/uploadFile";

export default class UploadFileDao {
  static async upload(req: Request) {
    const file = req.files;

    const doc = await imageUploader(file);

    console.log(doc);
    return doc;
  }
}
