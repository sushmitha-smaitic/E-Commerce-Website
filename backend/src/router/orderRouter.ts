import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import { Order, OrderModel } from "../models/orderModel";
import { Product, ProductModel } from "../models/productModel";
import { UserModel } from "../models/userModel";
import { isAdmin, isAuth } from "../utils";

export const orderRouter = express.Router();

// Get my orders
orderRouter.get(
  "/mine",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderModel.find({ user: req.user._id });
    res.json(orders);
  })
);

// Get all orders for admins
orderRouter.get("/", isAuth, isAdmin, async (req, res) => {
  const orders = await OrderModel.find().populate("user", "name");
  res.status(200).send(orders);
});

// Get List of all orders for admin
orderRouter.get(
  "/summary",
  isAuth,
  isAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await ProductModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

// Get One order by id
orderRouter.get(
  // /api/orders/:id
  "/:id",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  })
);

// create order
orderRouter.post(
  "/",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    if (req.body.orderItems.length === 0) {
      res.status(400).json({ message: "Cart is Empty" });
    } else {
      const createdOrder = await OrderModel.create({
        orderItems: req.body.orderItems.map((x: Product) => ({
          ...x,
          product: x._id,
        })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        deliverySpeed: req.body.deliverySpeed,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
      } as Order);

      res.status(201).json({ message: "Order Created", order: createdOrder });
    }
  })
);

// pay order by stripe
orderRouter.post(
  "/:id/stripe-payment-intent",
  asyncHandler(async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order) {
        res.status(404).send({ message: "Order Not Found" });
        return;
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2023-10-16",
      });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalPrice * 100,
        currency: "inr",
        payment_method_types: ["card"],
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error });
    }
  })
);

// Mark as paid
orderRouter.put(
  "/:id/pay",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date(Date.now());
      order.paymentResult =
        req.body.object === "payment_intent" // stripe
          ? {
              paymentId: req.body.id,
              status: req.body.status,
              update_time: req.body.created,
              email_address: req.body.receipt_email,
            }
          : {
              // paypal
              paymentId: req.body.id,
              status: req.body.status,
              update_time: req.body.update_time,
              email_address: req.body.email_address,
            };
      const updatedOrder = await order.save();

      res.send({ order: updatedOrder, message: "Order Paid Successfully" });
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  })
);

// mark as delivered
orderRouter.put(
  "/:id/deliver",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date(Date.now());
      const updatedOrder = await order.save();

      res.status(200).send({
        order: updatedOrder,
        message: "Order Delivered Successfully",
      });
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  })
);

// mark as shipped
orderRouter.put(
  "/:id/shipped",
  isAuth,
  isAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id);

    if (order) {
      order.isShipped = true;
      order.shippedAt = new Date(Date.now());
      const updatedOrder = await order.save();

      res.status(200).send({
        order: updatedOrder,
        message: "Order is Shipped",
      });
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  })
);

// mark as packed
orderRouter.put(
  "/:id/packed",
  isAuth,
  isAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id);

    if (order) {
      order.isPacked = true;
      order.packedAt = new Date(Date.now());
      const updatedOrder = await order.save();

      res.status(200).send({
        order: updatedOrder,
        message: "Order is Packaged",
      });
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  })
);

// delete order
orderRouter.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const order = await OrderModel.findOne({ _id: req.params.id });
  if (order) {
    const deletedOrder = await order.deleteOne();
    res.send(deletedOrder);
  } else {
    res.status(404).send("Order Not Found.");
  }
});

// mark as returned
orderRouter.put(
  "/:id/return",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await OrderModel.findById(orderId);

    if (order) {
      // Update order status to indicate it has been returned
      order.isReturned = true;
      order.returnedAt = new Date(); // Set the return date

      // Save the updated order
      const updatedOrder = await order.save();

      // Send response
      res.status(200).send({
        order: updatedOrder,
        message: "Order has been returned successfully",
      });
    } else {
      // If order not found, send 404 response
      res.status(404).json({ message: "Order not found" });
    }
  })
);

// mark as PickedUp return order
orderRouter.put(
  "/:id/return/pickup",
  isAuth,
  isAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id);

    if (order) {
      order.isPickedUp = true;
      order.PickedUpAt = new Date(Date.now());
      const updatedOrder = await order.save();

      res.status(200).send({
        order: updatedOrder,
        message: "Order is PickedUp",
      });
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  })
);
