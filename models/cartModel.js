const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, default: 1 },
      isFinished: { type: Boolean, default: false },
    },
  ],

  status: {
    type: String,
    enum: ["cart", "new", "confirmed", "canceled"],
    default: "cart",
  },

  priceFinall: {
    type: Number,
  },

  phone: {
    type: String,
  },

  date: {
    type: Date,
  },

  time: {
    type: String,
  },

  address: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now(),
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
