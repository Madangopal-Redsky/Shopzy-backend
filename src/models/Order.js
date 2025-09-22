const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "CARD"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema);

module.exports = { Order };
