// import  *  as  winston  from  'winston';
// import  'winston-daily-rotate-file';

// // Define a custom timezone function for timestamp formatting
// const timezone = () => {
//   return new Date().toLocaleString();
// };

// // Define file transport with daily rotation
// const fileTransport =  new winston.transports.DailyRotateFile({
//   filename: "error-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
//   maxFiles: "14d",
// });

// // Create a main logger instance
// const logger = winston.createLogger({
//   exitOnError: false,
//   level: "error",
//   format: winston.format.combine(
//     winston.format.timestamp({ format: timezone }),
//     winston.format.errors({ stack: true }),
//     winston.format.json(),
//     winston.format.prettyPrint()
//   ),
//   transports: [new winston.transports.Console(), fileTransport],
// });

// // Export the loggers
// export default logger;
// // Usage example:
// // logger.error('This is an error message');
// // payrollLogger.info('This is an info message for payroll');

import * as winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, prettyPrint, errors, json } = winston.format;

const fileTransport = new winston.transports.DailyRotateFile({
  filename: "./log/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const timezone = () => {
  return new Date().toLocaleString();
};

const logger = winston.createLogger({
  exitOnError: false,
  level: "error",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: timezone }),
    json(),
    prettyPrint()
  ),
  transports: [
    new winston.transports.Console(),
    fileTransport,
  ],
});

// winston.loggers.add("payrollLogger", {
//   level: "info",
//   format: combine(
//     errors({ stack: true }),
//     timestamp({ format: timezone }),
//     json(),
//     prettyPrint()
//   ),
//   transports: [
//     // new winston.transports.Console(),
//     new winston.transports.File({
//       filename: "payroll.log",
//       level: "info",
//     }),
//   ],
// });

export default logger;
