const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");
const { photoUpload } = require("../middlewares/photoUpload");
const {
  createOrderPayReceipt,
  getAllOrdersPayReceipt,
  getSingleOrderPayReceipt,
  deleteOrderPayReceipt,
  assignDriver,
  payOrder,
  updatePaymentStatus,
  updateDriverReceipt,
  getOrdersByReceiptsCount
} = require("../controllers/ordersPayReceiptController");

// /api/order-pay-receipt
router
  .route("/")
  .post(verifyToken, photoUpload.array("images"), createOrderPayReceipt)
  .get(verifyTokenAndAdmin, getAllOrdersPayReceipt);

// /api/order-pay-receipt/count
router.route("/count").get(getOrdersByReceiptsCount);
// /api/order-pay-receipt/:id
router
  .route("/:id")
  .get(verifyToken, getSingleOrderPayReceipt)
  .delete(verifyTokenAndAdmin, deleteOrderPayReceipt)
  .put(verifyTokenAndAdmin, assignDriver);
// /api/order-pay-receipt/pay/:id
router.route("/pay/:id").get(verifyToken, payOrder);
// /api/order-pay-receipt/status
router.route("/pay/status").put(updatePaymentStatus);
// /api/order-pay-receipt/driver-receipt/:id
router.route("/driver-receipt/:id").put(photoUpload.single("image"), updateDriverReceipt);
module.exports = router;
