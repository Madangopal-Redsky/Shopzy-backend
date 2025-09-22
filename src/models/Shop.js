const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    shopImage: {
      type: String,
      default: null,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true, 
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    description: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", ShopSchema);
module.exports = { Shop };
