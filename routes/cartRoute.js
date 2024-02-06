const express = require("express");
const {
  getNewCart,
  getAllConfirmedCartForUser,
  getAllCartsForAdmin,
  addProduct,
  updateQuantityAddOne,
  updateQuantityReduce,
  deleteProduct,
  checkoutCart,
  deleteCart,
  canceledCart,
  confirmedCart,
} = require("../controllers/cartController");

const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getNewCart).post(addProduct);

router.route("/:productId").delete(deleteProduct);

// router
//   .route("/:cartId")
//   .patch(updateQuantityAddOne)
//   .delete(orderController.deleteOrderById);

router.patch("/add-one", updateQuantityAddOne);
router.patch("/reduce", updateQuantityReduce);
router.post("/checkout", checkoutCart);
router.get("/confirmed/:role", getAllConfirmedCartForUser);

router.delete("/delete-cart/:cartId", deleteCart);

router.patch("/canceled-cart/:cartId", isAdmin, canceledCart);

router.patch("/confirmed-cart/:cartId", isAdmin, confirmedCart);

router.get("/admin", isAdmin, getAllCartsForAdmin);

module.exports = router;
