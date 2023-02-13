const router = require("express").Router();
const { changeSectionHero, getAllHeroSection } = require("../controllers/frontEndSettings");
const { photoUpload } = require("../middlewares/photoUpload");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/section/hero
router
  .route("/hero")
  .post(
    verifyTokenAndAdmin,
    photoUpload.single("background"),
    changeSectionHero
  ).get(verifyTokenAndAdmin, getAllHeroSection);

module.exports = router;
