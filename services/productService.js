const AppError = require("../utils/AppError");
const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const telegramService = require("../services/telegramService");
const Cart = require("../models/cartModel");

class ProductService {
  async createProduct(data) {
    const product = await Product.create({
      ...data,
    });

    await this.sendNotification(product);

    return product;
  }

  async updateProduct({ productId, data, next }) {
    const product = await Product.findByIdAndUpdate(productId, data, {
      new: true,
    });

    if (!product) {
      return next(new AppError("продукт не был обновлённ", 404));
    }

    return product;
  }

  async getAllProducts(queryStr) {
    if (queryStr.q && queryStr.q?.length > 2) {
      const regex = new RegExp(queryStr.q, "i");

      const products = await Product.find({
        $or: [
          { name: { $regex: regex } },
          { kind: { $regex: regex } },
          { type: { $regex: regex } },
          { occasion: { $regex: regex } },
          { made: { $regex: regex } },
        ],
      }).lean();

      return products;
    }

    const filter = {};

    const features = new APIFeatures(Product.find(filter), queryStr)
      .filters()
      .sort()
      .limitfields()
      .page();

    if (queryStr.likes) {
      features.query.sort({ "likes.length": -1 });
    }

    const products = await features.query;

    return products;
  }

  async deleteProductById(productId) {
    const productB = await Product.findByIdAndDelete(productId);

    if (!productB) {
      return next(new AppError("продукт не был найденн", 404));
    }

    const carts = await Cart.find({ "items.product": productB._id });

    if (!carts) {
      return;
    }

    // Обновляем каждую корзину
    for (const cart of carts) {
      const product = cart.items.find(
        (item) => item.product.toString() === productB._id.toString()
      );

      if (product) {
        if (cart.status !== "cart") {
          const totalPrice = productB.price * product.quantity;
          cart.priceFinall -= totalPrice;
        }
        cart.items.pull({ product: productB._id });
        await cart.save();
      }
    }
  }

  async findProductById(productId, next) {
    const product = await Product.findById(productId).lean();

    if (!product) {
      return next(new AppError("продукт небыл найденн", 404));
    }

    return product;
  }

  async sendNotification(data) {
    if (process.env.NODE_ENV !== "development") {
      await telegramService.sendPhoto(data.imageUrl);
    } else {
      await telegramService.sendPhoto(
        "https://images.fanart.tv/fanart/john-wick-5cdaceaf4e0a7.jpg"
      );
    }

    const msg = `<b>${data.name}</b>`;

    if (process.env.NODE_ENV !== "development") {
      await telegramService.sendMessage(msg, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                url: `${process.env.CLIENT_URL}/flower/${data._id}`,
                text: "Купить",
              },
            ],
          ],
        },
      });

      return;
    }

    await telegramService.sendMessage(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              url: "https://megacvet24.ru/tsvety/tyulpany/101-krasnyy-tyulpan-v-plenke.html",
              text: "Купить",
            },
          ],
        ],
      },
    });
  }
}

module.exports = new ProductService();
