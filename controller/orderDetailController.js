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
  try {
    let detail;
    const { order_detail_id } = req.query;
    if (order_detail_id) {
      detail = await OrderDetail.findAll({
        where: {
          check_in_status: "success",
          id: order_detail_id,
        },
        include: [
          {
            model: Order,
            where: {
              user_id: req.user.id,
              order_status: "success",
            },
            attributes: ["id"],
          },
          {
            model: BusSchedule,
            attributes: ["destination_city", "departure_city"],
            include: [
              {
                model: BusProvider,
                attributes: ["provider_name"],
              },
            ],
          },
          {
            model: UserReview,
          },
        ],
      });
    } else if (!order_detail_id) {
      detail = await OrderDetail.findAll({
        where: {
          check_in_status: "success",
        },
        include: [
          {
            model: Order,
            where: {
              user_id: req.user.id,
              order_status: "success",
            },
            attributes: ["id"],
          },
          {
            model: BusSchedule,
            attributes: ["destination_city", "departure_city"],
            include: [
              {
                model: BusProvider,
                attributes: ["provider_name"],
              },
            ],
          },
          {
            model: UserReview,
          },
        ],
      });
    }

    return res.status(200).json({ status: "success", data: detail });
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      message: "Error has been occured !",
      error: e,
    });
  }
}

module.exports = { createOrderDetail, showAllOrderDetailWithReview };
