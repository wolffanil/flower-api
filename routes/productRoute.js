const express = require("express");
const productController = require("../controllers/productController");

const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

// router.route("/").get(productController.getAllProducts).post(protect, isAdmin, productController.createProduct);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router
  .route("/:productId")
  .get(productController.getProductById)
  .patch(protect, isAdmin, productController.updateProduct)
  .delete(protect, isAdmin, productController.deleteProduct);

module.exports = router;
