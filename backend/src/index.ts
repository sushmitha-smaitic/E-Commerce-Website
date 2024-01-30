import cors from "cors";
import express, { Request, Response } from "express";
import { sampleProducts } from "./data";
const app = express();
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.get("/api/products", (req: Request, res: Response) => {
  res.json(sampleProducts);
});
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
