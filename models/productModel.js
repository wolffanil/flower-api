const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true },
  description: { type: String, lowercase: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  made: { type: String, lowercase: true },
  quantity: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    required: true,
    lowercase: true,
  },
  kind: {
    type: String,
    required: true,
    lowercase: true,
  },
  occasion: {
    type: String,
    required: true,
    lowercase: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
