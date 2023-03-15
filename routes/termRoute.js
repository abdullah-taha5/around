const router = require("express").Router();
const {
    createTerm, getTerm
} = require("../controllers/termController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/term
router
  .route("/")
  .post(verifyTokenAndAdmin, createTerm)
  .get(getTerm);

module.exports = router;