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

    const carts = await cartService.getAllConfirmedCartForUser(userId);

    return res.status(200).json({ carts });
  });

  getAllCartsForAdmin = catchAsync(async (req, res, next) => {
    const status = req.params.status;
    const carts = await cartService.getAllCartForAdmin(status);

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

  // updateOrderById = catchAsync(async (req, res, next) => {
  //   const { orderId } = req.params;

  //   const data = req.body;

  //   const order = await orderService.updateOrderBydId({ orderId, data, next });

  //   return res.status(200).json({ order });
  // });

  // deleteOrderById = catchAsync(async (req, res, next) => {
  //   const { orderId } = req.params;

  //   await orderService.deleteOrderById(orderId);

  //   return res.status(200).json({
  //     status: "success",
  //   });
  // });
}

module.exports = new CartController();
