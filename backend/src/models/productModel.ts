// import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

// @modelOptions({ schemaOptions: { timestamps: true } })
// export class Product {
//   public _id?: string;

//   @prop({ required: true })
//   public name!: string;

//   @prop({ required: true, unique: true })
//   public slug!: string;

//   @prop({ required: true })
//   public image!: string;

//   @prop({ required: true })
//   public brand!: string;

//   @prop({ required: true })
//   public category!: string;

//   @prop({ required: true })
//   public description!: string;

//   @prop({ required: true, default: 0 })
//   public price!: number;

//   @prop({ required: true, default: 0 })
//   public countInStock!: number;

//   @prop({ required: true, default: 0 })
//   public rating!: number;

//   @prop({ required: true, default: 0 })
//   public numReviews!: number;

//   @prop({ required: true, default: 0 })
//   public discount!: number;
// }

// export const ProductModel = getModelForClass(Product);

import { Schema, model } from "mongoose";

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
  discount: number;
}

export const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  countInStock: { type: Number, required: true },
  rating: { type: Number, required: true },
  numReviews: { type: Number, required: true },
  discount: { type: Number, required: true },
});

export const ProductModel = model<IProduct>("Product", productSchema);
