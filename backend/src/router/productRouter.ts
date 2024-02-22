import express from "express";
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
  asyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize: number = Number(query.pageSize) || PAGE_SIZE;
    const page: number = Number(query.page || 1);
    const category: string = String(query.category || "");
    const price: string = String(query.price || "");
    const rating: string = String(query.rating || "");
    const order: string = String(query.order || "");
    const searchQuery: string = String(query.query || "");

    const queryFilter: any =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter: any =
      category && category !== "all" ? { category } : {};
    const ratingFilter: any =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter: any =
      price && price !== "all"
        ? {
            // 1-50
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};
    const sortOrder: any =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };
    const products = await ProductModel.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts: number = await ProductModel.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
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
