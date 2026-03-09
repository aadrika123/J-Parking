import { Request } from "express";
import { imageUploader } from "../../../../lib/uploadFile";

export default class UploadFileDao {
  static async upload(req: Request) {

    const files = req.files as Express.Multer.File[];

    const { ulb_id, module_id, is_global_master } = req.body;

    const filesWithMeta = files.map((file) => ({
      ...file,
      ulb_id,
      module_id,
      is_global_master,
    }));

    const doc = await imageUploader(filesWithMeta);

    return doc;
  }
}
