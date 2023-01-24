const router = require("express").Router();
const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  profilePhotoUpload,
  deleteUserProfile,
} = require("../controllers/usersController");
const { photoUpload } = require("../middlewares/photoUpload");

const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verifyToken");

// /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsers);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(getUserProfile)
  .put(verifyToken, updateUserProfile)
  .delete(verifyTokenAndAdmin, deleteUserProfile);

// /api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, photoUpload.single("image"), profilePhotoUpload);

module.exports = router;
