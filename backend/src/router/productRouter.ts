import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ProductModel } from "../models/productModel";
import { isAdmin, isAuth } from "../utils";

export const productRouter = express.Router();

// /api/products
productRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await ProductModel.find();
    res.json(products);
  })
);

const PAGE_SIZE = 3;
productRouter.post(
  "/",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const product = new ProductModel({
      name: "Sample Name",
      price: 5000,
      user: req.user._id,
      image: "../../../frontend/public/images/Sample.jpg",
      brand: "Sample Brand",
      slug: "SampleProduct2",
      category: "Shirt",
      countInStock: 0,
      numReviews: 0,
      maxQuantity: 0,
      rating: 4.5,
      discount: 10,
      description: "Sample Description",
    });

    const createdProduct = await product.save();
    res.status(201).send(createdProduct);
  })
);

// /api/products/categories
productRouter.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = await ProductModel.find().distinct("category");
    res.send(categories);
  })
);

// /api/slug/:slug
productRouter.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const product = await ProductModel.findOne({ slug: req.params.slug });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  })
);

productRouter.get(
  "/search",
  asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const searchQuery = req.query.query || "";
    const category = (req.query.category || "") as string;
    const order = (req.query.order || "") as string;
    const price = (req.query.price || "") as string;

    const rating = req.query.rating || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};

    const categoryFilter = category && category !== "all" ? { category } : {};
    const priceFilter =
      price && price !== "all"
        ? {
            // 1-50
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};

    const ratingFilter =
      rating && rating !== "all" ? { rating: { $gte: Number(rating) } } : {};

    const countProducts = await ProductModel.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    const products = await ProductModel.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(
        order === "lowest"
          ? { price: 1 }
          : order === "highest"
          ? { price: -1 }
          : order === "toprated"
          ? { rating: -1 }
          : { _id: -1 }
      )
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE);
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / PAGE_SIZE),
    });
  })
);

// PUT /api/products/:id
//@desc update product
productRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const {
      name,
      slug,
      price,
      description,
      image,
      countInStock,
      brand,
      maxQuantity,
      discount,
    } = req.body;
    const product = await ProductModel.findById(req.params.id);
    if (product) {
      product.name = name;
      product.description = description;
      product.image = image;
      product.countInStock = countInStock;
      product.discount = discount;
      product.brand = brand;
      product.price = price;
      product.maxQuantity = maxQuantity;
      product.slug = slug;

      const updatedProduct = product.save();
      res.status(200).send(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Resource not found");
    }
  })
);
