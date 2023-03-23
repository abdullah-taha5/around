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
  getOrdersByReceiptsCount,
  updatePaymentStatusByAdminAndDelegate,
  multiSelectAssignDelegate,
  multiSelectDeleteOrder,
  updateOrder,
  updateFineReceipt,
  updateAnnual
} = require("../controllers/ordersPayReceiptController");

// /api/order-pay-receipt
router
  .route("/")
  .post(verifyToken, photoUpload.array("images"), createOrderPayReceipt)
  .get(verifyTokenAndAdmin, getAllOrdersPayReceipt)
  .put(verifyTokenAndAdmin, multiSelectAssignDelegate)
  .delete(multiSelectDeleteOrder);
// /api/order-pay-receipt/update/:id
router.route("/update/:id").put(verifyToken, updateOrder);
// /api/order-pay-receipt/fine-receipt/:id
router.route("/fine-receipt/:id").put(verifyToken, photoUpload.single("receipt"), updateFineReceipt);
// /api/order-pay-receipt/annual/:id
router.route("/annual/:id").put(verifyToken, photoUpload.single("annual"), updateAnnual);

// /api/order-pay-receipt/count
router.route("/count").get(getOrdersByReceiptsCount);
// /api/order-pay-receipt/order/:id
router
  .route("/order/:id")
  .put(verifyToken, updatePaymentStatusByAdminAndDelegate);
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
router
  .route("/driver-receipt/:id")
  .put(photoUpload.single("image"), updateDriverReceipt);
module.exports = router;
