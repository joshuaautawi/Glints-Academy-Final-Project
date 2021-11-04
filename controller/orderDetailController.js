const { OrderDetail, Order, UserReview } = require("../models");

async function createOrderDetail(detail) {
  const { order_id, bus_schedule_id, departure_date, return_date } = detail;
  const result = await OrderDetail.create({
    order_id,
    bus_schedule_id,
    departure_date,
    return_date,
  });
  return result;
}

async function showAllOrderDetailWithReview(req, res) {
  const { id } = req.user;
  try {
    const detail = await OrderDetail.findAll({
      include: [
        {
          model: Order,
          where: {
            user_id: id,
          },
        },
        {
          model: UserReview,
        },
      ],
    });
    if (detail.length == 0)
      return res.status(400).json({
        status: "failed",
        message: "Review is not found !",
      });
    return res.status(200).json({
      status: "success",
      data: detail,
    });
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      message: "Error has occured !",
      error: e,
    });
  }
}

module.exports = { createOrderDetail, showAllOrderDetailWithReview };
