const catchAsync = require("../utils/catchAsync");
const productService = require("../services/productService");

class ProdcutController {
  createProduct = catchAsync(async (req, res, next) => {
    const data = req.body;

    const product = await productService.createProduct(data);

    return res.status(201).json({ product });
  });

  updateProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const data = req.body;

    const product = await productService.updateProduct({
      productId,
      data,
      next,
    });

    return res.status(200).json({ product });
  });

  getAllProducts = catchAsync(async (req, res, next) => {
    const query = req.query;

    const products = await productService.getAllProducts(query);

    return res.status(200).json({ products });
  });

  getProductById = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const product = await productService.findProductById(productId, next);

    return res.status(200).json({ product });
  });

  deleteProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    await productService.deleteProductById(productId);

    return res.status(200).json({
      status: "success",
    });
  });
}

module.exports = new ProdcutController();
