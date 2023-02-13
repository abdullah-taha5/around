const {
  registerDriver,
  loginDriver,
  deleteDriverProfile,
  getAllDrivers,
  updateDriverProfile,
  profilePhotoUpload,
  getDriver,
} = require("../controllers/driverController");
const { photoUpload } = require("../middlewares/photoUpload");
const { verifyTokenAndAdmin, verifyToken } = require("../middlewares/verifyToken");

const router = require("express").Router();

// /api/driver/register
router.post("/register", registerDriver);
// /api/driver/login
router.post("/login", loginDriver);
// /api/driver/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllDrivers);
// /api/driver
router.route("/").get(verifyToken, getDriver);
// /api/driver/profile/:id
router.route("/profile/:id")
.delete(verifyTokenAndAdmin, deleteDriverProfile)
.put(verifyToken, updateDriverProfile);

// /api/driver/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, photoUpload.single("image"), profilePhotoUpload);


module.exports = router;
