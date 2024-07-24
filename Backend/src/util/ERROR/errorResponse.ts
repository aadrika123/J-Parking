import { Response } from "express";
import ErrorMessage from "../errorCodes";
import logger from "../../../winston.config";

/**
 * | Response Msg Version with apiMetaData
 */

export const errorResponse = async (
  status: boolean,
  message: any,
  resData: unknown,
  responseCode: number,
  action: string,
  apiId: string,
  version: string,
  res: Response,
  deviceId?: string
): Promise<any> => {
  if (!status) {
    resData = ErrorMessage[resData as keyof typeof ErrorMessage];
  }

  if (message && message?.code && message?.meta?.cause) {
    // message = errorCodes[message?.code as keyof typeof errorCodes];
    message = message.meta.cause;
    responseCode = 400;
  } else {
    message = message?.message || message;
  }

  const jsonRes = {
    status,
    message,
    "meta-data": {
      apiId,
      version,
      responseTime: res.locals.responseTime,
      action,
      deviceId,
    },
    data: resData,
  };

  // logger.error(
  //   `Date & Time:- ${new Date().toISOString()}  status = ${res.locals.jsonRes.status}, err = ${
  //     res.locals.jsonRes.message
  //   } `
  // );

  logger.error({
    date: new Date().toISOString(),
    message: message,
    apiId: apiId,
  });

  res.status(responseCode).json(jsonRes);
};

// ${req.method} ${resTime} ${
//   req.url
// }
