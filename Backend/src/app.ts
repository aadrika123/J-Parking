import express from "express";
import dotenv from "dotenv";
import ParkingRoute from "./component/juidcoPTMS/router";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(express.urlencoded({ extended: true }));

/// Parking ///
new ParkingRoute(app);

export default app;
