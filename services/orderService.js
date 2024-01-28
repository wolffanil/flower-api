const Order = require('../models/orderModel');
const AppError = require('../utils/AppError');

class OrderService {
    async createOrder({data, userId, next}) {
        if(!userId) return next(new AppError("нету id пользователя", 400));

        const order = await Order.create({...data, user: userId});

        if(!order) return next(new AppError('Ошибка создание заказа', 400));

        return order;
    }

    async getAllOrderForAdmin() {
        const orders = await Order.find().populate('user').sort({createAt: -1}).lean();

        return orders;
    }

    async getAllOrderForUser(userId) {
        const orders = await Order.find({ user: userId}).sort({createAt: -1}).lean();

        return orders;
    }


    async deleteOrderById(orderId) {
        await Order.findByIdAndDelete(orderId);

    }

    async updateOrderBydId({orderId, data, next}) {
        const order = await Order.findByIdAndUpdate(orderId, data, {
            new: true
        });

        if(!order) return next(new AppError('заказ не был обновлённ', 404));

        return order;
    }


}

module.exports = new OrderService();