import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import { keyRouter } from "./router/keyRouter";
import { orderRouter } from "./router/orderRouter";
import { productRouter } from "./router/productRouter";
import { seedRouter } from "./router/seedRouter";
import { uploadRouter } from "./router/uploadRouter";
import { userRouter } from "./router/userRouter";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/IndianBazaardb";
mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch(() => {
    console.log("error mongodb");
  });
const app = express();
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:5173"],
//   })
// );
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/api/products", productRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/seed", seedRouter);
app.use("/api/keys", keyRouter);

//const __dirname = path.resolve();
app.use("/upload", express.static("../../frontend/public/images"));

app.use(express.static(path.join(__dirname, "../../frontend")));
app.get("/", (req: Request, res: Response) =>
  res.sendFile(path.join(__dirname, "../../frontend/index.html"))
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send({ message: err.message });
  next();
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
