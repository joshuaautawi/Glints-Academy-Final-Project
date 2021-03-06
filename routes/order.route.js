const router = require("express").Router();
const {
  createOrder,
  seatArrangement,
  showOrderDetail,
  showTicketDetail,
  showTicket,
} = require("../controller/orderController");
const {
  createOrderValidate,
  seatArrangementValidate,
} = require("../middleware/validation/orderValidation");
const {
  showAllOrderDetailWithReview,
} = require("../controller/orderDetailController");

router.post("/", createOrderValidate, createOrder);
router.get("/", seatArrangementValidate, seatArrangement);
router.get("/review", showAllOrderDetailWithReview);
router.get("/detail", showOrderDetail);
router.get("/ticket", showTicketDetail);
router.get("/e-ticket", showTicket);

module.exports = router;
