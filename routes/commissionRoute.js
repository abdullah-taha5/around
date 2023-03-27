const router = require("express").Router();
const {
  createCommission,
  getCommissions,
  createCommissionByReceipts,
  getCommissionByReceipts,
  getCommissionByReceiptsUpdate,
} = require("../controllers/commissionController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/commission
router
  .route("/")
  .post(verifyTokenAndAdmin, createCommission)
  .get(getCommissions);

// /api/commission/receipts
router.route("/receipts").post(verifyTokenAndAdmin, createCommissionByReceipts);

// /api/commission/receipts/:price
router.route("/receipts/:price").get(getCommissionByReceipts);

// /api/commission/receipts-update
router.route("/receipts-update").get(getCommissionByReceiptsUpdate);
module.exports = router;
