const AppError = require("../utils/AppError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");

class CartService {
  async confirmedCart(cartId, next) {
    const cart = await Cart.findById(cartId);

    console.log(cart, "cart");

    if (cart && cart.status !== "confirmed") {
      cart.status = "confirmed";
      cart.cause = undefined;
      await cart.save();

      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.likes++;
          await product.save();
        }
      }

      return "success";
    } else {
      return next(
        new AppError("Каризи не была найденна или уже была подверждинна", 404)
      );
    }
  }

  async deleteOrCancelCart(cartId, action, cause, next) {
    let cart;

    if (action === "delete") {
      cart = await Cart.findByIdAndDelete(cartId);
    } else {
      cart = await Cart.findByIdAndUpdate(cartId, {
        cause,
        status: "canceled",
      });
    }

    if (cart) {
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
        });
      }

      return "success";
    } else {
      return next(new AppError("Заказ не был найден", 404));
    }
  }

  async getAllCartForAdmin(queryStr) {
    // const carts = await Cart.find({
    //   status: status ? status : { $ne: "cart" },
    // })
    //   .populate("user")
    //   .sort({ createAt: -1 })
    //   .lean();

    const filter = {};

    const features = new APIFeatures(Cart.find(filter), queryStr)
      .filters()
      .sort()
      .limitfields()
      .page();

    const carts = await features.query;
    // .populate("user")
    // .sort({ createAt: -1 })
    // .lean();

    return carts;
  }

  async getNewCart(userId) {
    let cart = await Cart.findOne({ user: userId, status: "cart" }).populate(
      "items.product"
    );

    if (!cart) {
      const cart = await Cart.create({
        user: userId,
        items: [],
        status: "cart",
      });

      return cart;
    }

    // Проверка и обновление количества товаров в корзине
    for (let item of cart.items) {
      if (item.quantity > item.product.quantity) {
        item.quantity = item.product.quantity;
      }
      if (item.product.quantity === 0) {
        item.isFinished = true;
      }

      if (item.product.quantity > 0 && item.isFinished === true) {
        item.isFinished = false;
        item.quantity = 1;
      }
    }

    // Сохранение обновленной корзины
    await cart.save();

    return cart;
  }

  async getAllConfirmedCartForUser(userId, role) {
    let carts;

    if (role === "admin") {
      carts = await Cart.find({ status: { $ne: "cart" } })
        .populate({
          path: "items.product",
          select: "_id imageUrl",
        })
        .populate("user")
        .sort({ createAt: -1 })
        .lean();
    } else {
      carts = await Cart.find({ status: { $ne: "cart" }, user: userId })
        .sort({ createAt: -1 })
        .populate({
          path: "items.product",
          select: "_id imageUrl",
        })
        .lean();
    }

    return carts;
  }

  async addProduct(userId, productId, maxQuantity, next) {
    let cart = await Cart.findOne({ user: userId, status: "cart" });
    const flower = await Product.findById(productId).lean();

    if (!flower) {
      return next(new AppError("Товар был удалённ", 400));
    }

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: 1 }],
        status: "cart",
      });
    } else {
      // Проверить наличие товара и обновить количество
      let item = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (item) {
        // Проверить превышение максимального количества товара
        if (item.quantity < flower.quantity && flower.quantity !== 0) {
          item.quantity += 1;
        } else {
          return next(
            new AppError(
              "Превышено максимально допустимое количество товара",
              400
            )
          );
        }
      } else {
        if (flower.quantity === 0) {
          return next(
            new AppError(
              "Превышено максимально допустимое количество товара",
              400
            )
          );
        }
        cart.items.push({ product: productId, quantity: 1 });
      }
    }

    await cart.save();

    return cart;
  }

  async updateQuantityAddOne(userId, productId, next) {
    const cart = await Cart.findOne({ user: userId, status: "cart" });
    const product = await Product.findById(productId);

    if (!cart || !product) {
      return next(new AppError("Карзина или продект не найденно", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Проверяем, достаточно ли товара на складе
      if (product.quantity >= item.quantity + 1) {
        cart.items[itemIndex].quantity = cart.items[itemIndex].quantity + 1;
        //   } else if (quantity === 0) {
        //     // Удаляем товар из корзины, если его количество равно нулю
        //     cart.items.splice(itemIndex, 1);
      } else {
        return next(
          new AppError(
            "Некоректно кол-во. Не достаточно товаров на складе",
            400
          )
        );
      }
      // } else if (quantity > 0) {
      //   cart.items.push({ product: productId, quantity: 1 });
    } else {
      return next(new AppError("Товар не найде в карзине"));
    }

    await cart.save();

    return cart;
  }

  async checkoutCart(userId, geo, next) {
    const cart = await Cart.findOne({ user: userId, status: "cart" }).populate(
      "items.product"
    );

    if (!cart) {
      return next(new AppError("Карзина не найденна", 404));
    }

    // Проверяем достаточно ли товаров на складе
    let outOfStock = cart.items.some((item) => {
      return item.quantity > item.product.quantity;
    });

    if (outOfStock) {
      return next(
        new AppError(
          "Один или болие продуктов закончились на складе, пожалуйста обновите карзину",
          400
        )
      );
    }

    // Уменьшаем количество товаров на складе
    await Promise.all(
      cart.items.map((item) => {
        return Product.updateOne(
          { _id: item.product._id },
          { $inc: { quantity: -item.quantity } }
        );
      })
    );

    // Обновляем статус корзины
    let price = 0;
    cart.items.forEach((item) => {
      price += item.quantity * item.product.price;
    });

    cart.status = "new";
    cart.priceFinall = price;

    cart.date = geo.date;
    cart.time = geo.time;
    cart.address = geo.address;
    cart.phone = geo.phone;

    await cart.save();

    return cart;
  }

  async updateQuantityReduce(userId, productId, next) {
    const cart = await Cart.findOne({ user: userId, status: "cart" });

    if (!cart) {
      return next(new AppError("Карзина или продект не найденно", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Проверяем, достаточно ли товара на складе
      if (item.quantity - 1 > 0) {
        cart.items[itemIndex].quantity = cart.items[itemIndex].quantity - 1;
        //   } else if (quantity === 0) {
        //     // Удаляем товар из корзины, если его количество равно нулю
        //     cart.items.splice(itemIndex, 1);
      } else {
        return next(new AppError("Некроректно кол-во.", 400));
      }
      // } else if (quantity > 0) {
      //   cart.items.push({ product: productId, quantity: 1 });
    } else {
      return next(new AppError("Товар не найде в карзине"));
    }

    await cart.save();

    return cart;
  }

  async deleteProduct(productId, userId, next) {
    const cart = await Cart.findOne({ user: userId, status: "cart" });

    if (!cart) {
      return next(new AppError("Карзина не найденна", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new AppError("Продукт не был найден в карзине", 404));
    }

    // Удаляем товар из массива
    cart.items.splice(itemIndex, 1);
    await cart.save();

    return cart;
  }
}

module.exports = new CartService();
