const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  made: { type: String },
  quantity: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    // required: true
  },
  kind: {
    type: String,
    // required: true
  },
  occasion: {
    type: String,
    // required: true
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
