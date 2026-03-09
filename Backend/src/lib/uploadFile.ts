import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";

// export const imageUploader = async (file: any) => {
//   const toReturn: any[] = [];

//   await Promise.all(
//     file.map(async (item: any) => {
//       const hashed = crypto
//         .createHash("SHA256")
//         .update(item?.buffer)
//         .digest("hex");

//       const formData = new FormData();
//       formData.append("file", item?.buffer, item?.mimetype);
//       formData.append("tags", item?.originalname.substring(0, 7));

//       const headers = {
//         "x-digest": hashed,
//         token: "8Ufn6Jio6Obv9V7VXeP7gbzHSyRJcKluQOGorAD58qA1IQKYE0",
//         folderPathId: 1,
//         ...formData.getHeaders(),
//       };

//       await axios
//         .post(process.env.DMS_UPLOAD || "", formData, { headers })
//         .then((response) => {
//           toReturn.push(response?.data?.data);
//         })
//         .catch((err) => {
//           throw err;
//         });
//     })
//   );

//   return toReturn;
// };


export const imageUploader = async (file: any) => {
  const token = process.env.DMS_TOKEN;
  const toReturn: any[] = [];

  if (!file || file.length === 0) {
    throw new Error("No files provided for upload.");
  }

  await Promise.all(
    file.map(async (item: any) => {

      const hashed = crypto
        .createHash("sha256")
        .update(item?.buffer)
        .digest("hex");

      const formData = new FormData();

      formData.append("file", item?.buffer, {
        filename: item?.originalname,
        contentType: item?.mimetype,
      });

      formData.append("tags", item?.originalname.substring(0, 7));

      // Metadata support
      if (item?.is_global_master) {
        formData.append("is_global_master", "true");
      } else if (item?.ulb_id && !item?.module_id) {
        formData.append("ulb_id", item?.ulb_id);
      } else if (item?.ulb_id && item?.module_id) {
        formData.append("ulb_id", item?.ulb_id);
        formData.append("module_id", item?.module_id);
      }

      const headers = {
        token: token,
        "x-digest": hashed,
        ...formData.getHeaders(),
      };

      try {
        // Upload file
        const uploadResponse = await axios.post(
          process.env.DMS_UPLOAD || "",
          formData,
          { headers }
        );

        const referenceNo = uploadResponse?.data?.data?.ReferenceNo;

        if (!referenceNo) {
          throw new Error("ReferenceNo not returned from DMS.");
        }

        // Fetch full file path
        const getResponse = await axios.post(
          process.env.DMS_GET || "",
          { referenceNo },
          {
            headers: { token: token },
          }
        );

        const fullPath = getResponse?.data?.data?.fullPath;

        if (fullPath) {
          toReturn.push(fullPath);
        } else {
          throw new Error("Failed to retrieve file path from DMS.");
        }

      } catch (err) {
        throw err;
      }

    })
  );

  return toReturn;
};