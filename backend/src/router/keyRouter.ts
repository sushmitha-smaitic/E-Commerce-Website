import express from "express";

export const keyRouter = express.Router();
// /api/keys/paypal
keyRouter.get("/paypal", (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID || "sb" });
});

keyRouter.get("/stripe", (req, res) => {
  res.json({ key: process.env.STRIPE_PUBLISHABLE_KEY });
});
