import asyncHandler from "express-async-handler";
import { ProductModel } from "../models/productModel";

export class ProductController {
  getProducts = () => {
    asyncHandler(async (req, res) => {
      const products = await ProductModel.find();
      res.json(products);
    });
  };

  getProduct = () => {
    asyncHandler(async (req, res) => {
      const product = await ProductModel.findOne({ slug: req.params.slug });
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product Not Found" });
      }
    });
  };

  constructor() {}
}
