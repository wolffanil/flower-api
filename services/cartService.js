const AppError = require("../utils/AppError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

class CartService {
  async getAllCartForAdmin(status) {
    const carts = await Cart.find({
      status: status ? status : { $ne: "new" },
    })
      .populate("user")
      .sort({ createAt: -1 })
      .lean();

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
        item.quantity = 0;
        item.isFinished = true;
      }
    }

    // Сохранение обновленной корзины
    await cart.save();

    return cart;
  }

  async getAllConfirmedCartForUser(userId) {
    const carts = await Cart.find({ status: { $ne: "cart" }, userId })
      .sort({ createAt: -1 })
      .lean();

    return carts;
  }

  //   async deleteOrderById(orderId) {
  //     await Order.findByIdAndDelete(orderId);
  //   }

  //   async updateOrderBydId({ orderId, data, next }) {
  //     const order = await Order.findByIdAndUpdate(orderId, data, {
  //       new: true,
  //     });

  //     if (!order) return next(new AppError("заказ не был обновлённ", 404));

  //     return order;
  //   }

  async addProduct(userId, productId, maxQuantity, next) {
    let cart = await Cart.findOne({ user: userId, status: "cart" });
    const flower = await Product.findById(productId).lean();

    console.log(flower);
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
