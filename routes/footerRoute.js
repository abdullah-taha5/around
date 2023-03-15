const router = require("express").Router();
const {
  changeSectionFooter,
  getFooterSection,
} = require("../controllers/footerController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/footer
router
  .route("/")
  .post(verifyTokenAndAdmin, changeSectionFooter)
  .get(getFooterSection);
module.exports = router;
