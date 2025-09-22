const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  },
  { timestamps: true }
);

const Category = model('Category', CategorySchema);

module.exports = { Category };
