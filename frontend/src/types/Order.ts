import { cartItem, shippingAddress } from "./Cart";
import { User } from "./User";

export type Order = {
  _id: string;
  orderItems: cartItem[];
  shippingAddress: shippingAddress;
  paymentMethod: string;
  user: User;
  createdAt: string;
  isPaid: boolean;
  paidAt: string;
  isShipped: boolean;
  shippedAt: string;
  isPacked: boolean;
  packedAt: string;
  isDelivered: boolean;
  deliveredAt: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};
