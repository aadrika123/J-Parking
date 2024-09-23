import express from "express";
import OnBoardingInchargeRoute from "./route/onBoardingParkingIncharge/onBoardingParkingIncharge.route";
import OnBoardingAreaRoute from "./route/onBoardingParkingArea/onBoardingParkingArea.route";
import FileUploadRoute from "./route/fileUpload.route";
import ScheduleInchargeRoute from "./route/scheduleIncharge/scheduleIncharge.route";
import ReceiptRoute from "./route/receipt/receipt.route";
import ReportRoute from "./route/report/report.route";
import UserRoute from "./route/user/user.route";
import AccountantRoute from "./route/accountant/accountant.route";

/*
|--------------------------------------------------------------------------
| API Routes
| Author- Krish
| Created On- 06-06-2024 
| Created for- juidco_parking
| Module status- Open
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
|
*/
/**
 * | Comman Route for ptms
 */

export default class ParkingRoute {
  constructor(app: express.Application) {
    new FileUploadRoute(app);
    new OnBoardingInchargeRoute(app);
    new OnBoardingAreaRoute(app);
    new ScheduleInchargeRoute(app);
    new ReceiptRoute(app);
    new ReportRoute(app);
    new UserRoute(app);
    new AccountantRoute(app);
  }
}
