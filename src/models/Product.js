const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ReviewSchema = new Schema({
  rating: Number,
  comment: String,
  date: Date,
  reviewerName: String,
  reviewerEmail: String,
});

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true},
    price: { type: Number, required: true },
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    tags: [String],
    brand: String,
    sku: String,
    weight: Number,
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
    warrantyInformation: String,
    shippingInformation: String,
    availabilityStatus: String,
    reviews: [ReviewSchema],
    returnPolicy: String,
    minimumOrderQuantity: Number,
    meta: {
      createdAt: Date,
      updatedAt: Date,
      barcode: String,
      qrCode: String,
    },
    images: [String],
    thumbnail: String,
  },
  { timestamps: true }
);

const Product = model('Product', ProductSchema);

module.exports = { Product };
