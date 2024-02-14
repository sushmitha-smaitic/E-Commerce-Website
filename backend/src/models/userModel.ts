// import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

// @modelOptions({ schemaOptions: { timestamps: true } })
// export class User {
//   public _id?: string;

//   @prop({ required: true })
//   public name!: string;

//   @prop({ required: true, unique: true })
//   public email!: string;

//   @prop({ required: true })
//   public password!: string;

//   @prop({ required: true, default: false })
//   public isAdmin!: boolean;
// }

// export const UserModel = getModelForClass(User);

import { Schema, model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
});

export const UserModel = model<IUser>("User", userSchema);
