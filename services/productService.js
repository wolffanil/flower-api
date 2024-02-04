const Product = require("../models/productModel");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const telegramService = require("../services/telegramService");

class ProductService {
  async createProduct(data) {
    console.log(data, "DATA");

    const product = await Product.create(data);

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
    // let query = {};

    // if (queryStr.type) {
    //     query.type = queryStr.type;
    // }

    // if (queryStr.kind) {
    //     query.kind = queryStr.kind;
    // }

    // if (queryStr.occasion) {
    //     query.occasion = queryStr.occasion;
    // }

    // if (queryStr.priceMin && queryStr.priceMax) {
    //     query.price = { $gte: queryStr.priceMin, $lte: queryStr.priceMax};
    // } else if (queryStr.priceMin) {
    //     query.price = { $gte: queryStr.priceMin}
    // } else if (queryStr.priceMax) {
    //     query.price = { $lte: queryStr.priceMax};
    // }

    // let products = [];

    // if( queryStr.limit) {

    //     products = await Product.find(query).limit(Number(queryStr.limit)).sort({ createAt: -1}).lean();

    // } else {
    //     products = await Product.find(query).lean();
    // }

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

    const products = await features.query;

    return products;
  }

  async deleteProductById(productId) {
    await Product.findByIdAndDelete(productId);
  }

  async findProductById(productId, next) {
    const product = await Product.findById(productId).lean();

    if (!product) {
      return next(new AppError("продукт небыл найденн", 404));
    }

    return product;
  }

  async sendNotification(data) {
    if (process.env.NODE_ENV !== "development")
      await telegramService.sendPhoto(data.imageUrl);

    await telegramService.sendPhoto(
      "https://images.fanart.tv/fanart/john-wick-5cdaceaf4e0a7.jpg"
    );

    const msg = `<b>${data.name}</b>`;

    await telegramService.sendMessage(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              url: "https://megacvet24.ru/tsvety/tyulpany/101-krasnyy-tyulpan-v-plenke.html",
              text: "Go to buy",
            },
          ],
        ],
      },
    });
  }
}

module.exports = new ProductService();
