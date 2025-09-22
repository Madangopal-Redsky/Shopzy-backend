const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Auth", required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

const Cart = model("Cart", CartSchema);
module.exports = { Cart };
