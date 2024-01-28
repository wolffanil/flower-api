const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');

class OrderController {
    createOrder = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const data = req.body;

        const order = await orderService.createOrder({data, userId, next});

        return res.status(201).json({order});
    });

    getAllOrderForUser = catchAsync(async (req, res, next) => {
        const userId = req.user.id;

        const orders = await orderService.getAllOrderForUser(userId);

        return res.status(200).json({orders});
    });

    getAllOrderForAdmin = catchAsync(async (req, res, next) => {

        const orders = await orderService.getAllOrderForAdmin();

        return res.status(200).json({orders});
    });

    updateOrderById = catchAsync(async (req, res, next) => {
        const {orderId} = req.params;

        const data = req.body;

        const order = await orderService.updateOrderBydId({ orderId, data, next});

        return res.status(200).json({order});
    });

    deleteOrderById = catchAsync(async (req, res, next) => {
        const {orderId} = req.params;

        await orderService.deleteOrderById(orderId);

        return res.status(200).json({
            status: 'success'
        });
    });

}

module.exports = new OrderController();