const express = require('express');
const orderController = require('../controllers/orderController');

const protect = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');

const router  = express.Router();


router.use(protect);

router.route('/').get(orderController.getAllOrderForUser).post(isAdmin, orderController.createOrder).get(isAdmin, orderController.getAllOrderForAdmin);

router.route('/:orderId').patch(orderController.updateOrderById).delete(orderController.deleteOrderById);


module.exports = router;
