import mongoose, { Connection } from "mongoose";
import config from "../../../config/config.json";

export class MongoService {
  private static instance: MongoService;
  private dbConnection: Connection | undefined;

  private constructor() {
    this.dbConnection = mongoose.connection;

    this.dbConnection.once("open", () => {
      console.log("SUCCESS", "Connected to MongoDB successfully");
    });

    this.dbConnection.on("error", (error: Error) => {
      console.log(
        "ERROR",
        "Error establishing connection between the server",
        error
      );
    });

    mongoose.connect(config.mongo.connectionUrl || "").catch((err: Error) => {
      console.error("ERROR", "Error connecting to MongoDB:", err);
    });
  }

  public static getInstance(): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }
}
