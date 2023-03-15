const router = require("express").Router();
const {
  changeSectionHero,
  getAllHeroSection,
} = require("../controllers/heroController");
const { photoUpload } = require("../middlewares/photoUpload");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/hero
router
  .route("/")
  .post(
    verifyTokenAndAdmin,
    photoUpload.single("background"),
    changeSectionHero
  )
  .get(getAllHeroSection);
module.exports = router;
