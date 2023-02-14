const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteOrder,
  assignDriver,
  payOrder,
  updatePaymentStatus,
} = require("../controllers/ordersController");

// /api/orders
router
  .route("/")
  .post(verifyToken, createOrder)
  .get(verifyTokenAndAdmin, getAllOrders);
// /api/orders/:id
router
  .route("/:id")
  .get(verifyTokenAndAdmin, getSingleOrder)
  .delete(verifyTokenAndAdmin, deleteOrder)
  .put(verifyTokenAndAdmin, assignDriver);

// /api/orders/pay/:id

router.route("/pay/:id").get(verifyToken, payOrder);

// /api/orders/pay/status
router.route("/pay/status").put(updatePaymentStatus);
module.exports = router;
