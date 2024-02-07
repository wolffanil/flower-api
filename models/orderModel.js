const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],

    status: {
      type: String,
      enum: ["new", "confirmed", "canceled"],
      default: "new",
    },
    createAt: {
      type: Date,
      default: Date.now()
    }
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
