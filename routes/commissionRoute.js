const router = require("express").Router();
const {
  createCommission,
  getCommissions,
  createCommissionByReceipts,
  getCommissionByReceipts,
} = require("../controllers/commissionController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/commission
router
  .route("/")
  .post(verifyTokenAndAdmin, createCommission)
  .get(getCommissions);

// /api/commission/receipts
router
  .route("/receipts")
  .post(verifyTokenAndAdmin, createCommissionByReceipts);
  
  router.route("/receipts/:price").get(getCommissionByReceipts);
module.exports = router;
