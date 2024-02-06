const cartService = require("../services/cartService");
const catchAsync = require("../utils/catchAsync");

class CartController {
  // createOrder = catchAsync(async (req, res, next) => {
  //   const userId = req.user.id;
  //   const data = req.body;

  //   const order = await orderService.createOrder({ data, userId, next });

  //   return res.status(201).json({ order });
  // });

  getAllConfirmedCartForUser = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const role = req.params.role;

    const carts = await cartService.getAllConfirmedCartForUser(userId, role);

    return res.status(200).json({ carts });
  });

  getAllCartsForAdmin = catchAsync(async (req, res, next) => {
    const queryStr = req.query;

    console.log(queryStr);
    const carts = await cartService.getAllCartForAdmin(queryStr);

    return res.status(200).json({ carts });
  });

  getNewCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const cart = await cartService.getNewCart(userId);

    return res.status(200).json({ cart });
  });

  addProduct = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const productId = req.body.productId;
    const maxQuantity = req.body.maxQuantity;

    const cart = await cartService.addProduct(
      userId,
      productId,
      maxQuantity,
      next
    );

    return res.status(201).json({ cart });
  });

  updateQuantityAddOne = catchAsync(async (req, res, next) => {
    const productId = req.body.productId;
    const userId = req.user.id;

    const cart = await cartService.updateQuantityAddOne(
      userId,
      productId,
      next
    );

    return res.status(200).json({ cart });
  });

  updateQuantityReduce = catchAsync(async (req, res, next) => {
    const productId = req.body.productId;
    const userId = req.user.id;

    const cart = await cartService.updateQuantityReduce(
      userId,
      productId,
      next
    );

    return res.status(200).json({ cart });
  });

  deleteProduct = catchAsync(async (req, res, next) => {
    const productId = req.params.productId;
    const userId = req.user.id;

    const cart = await cartService.deleteProduct(productId, userId, next);

    return res.status(204).json({ cart });
  });

  checkoutCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const geo = req.body;
    const cart = await cartService.checkoutCart(userId, geo, next);

    return res.status(200).json({ cart });
  });

  deleteCart = catchAsync(async (req, res, next) => {
    const cartId = req.params.cartId;
    const status = await cartService.deleteOrCancelCart(
      cartId,
      "delete",
      "",
      next
    );

    return res.status(204).json({ status });
  });

  canceledCart = catchAsync(async (req, res, next) => {
    const cartId = req.params.cartId;
    const cause = req.body.cause;

    const status = await cartService.deleteOrCancelCart(
      cartId,
      "canceled",
      cause,
      next
    );

    return res.status(204).json({ status });
  });

  confirmedCart = catchAsync(async (req, res, next) => {
    const cartId = req.params.cartId;

    const status = await cartService.confirmedCart(cartId, next);

    return res.status(200).json({ status });
  });
}

module.exports = new CartController();
