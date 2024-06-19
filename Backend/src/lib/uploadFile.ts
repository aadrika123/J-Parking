import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";

export const imageUploader = async (file: any) => {
  const toReturn: any[] = [];

  await Promise.all(
    file.map(async (item: any) => {
      const hashed = crypto
        .createHash("SHA256")
        .update(item?.buffer)
        .digest("hex");

      const formData = new FormData();
      formData.append("file", item?.buffer, item?.mimetype);
      formData.append("tags", item?.originalname.substring(0, 7));

      const headers = {
        "x-digest": hashed,
        token: "8Ufn6Jio6Obv9V7VXeP7gbzHSyRJcKluQOGorAD58qA1IQKYE0",
        folderPathId: 1,
        ...formData.getHeaders(),
      };

      await axios
        .post(process.env.DMS_UPLOAD || "", formData, { headers })
        .then((response) => {
          toReturn.push(response?.data?.data);
        })
        .catch((err) => {
          throw err;
        });
    })
  );

  return toReturn;
};
