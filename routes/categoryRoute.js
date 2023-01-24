const {
  createCategory,
  getAllCategories,
  deleteCategory,
} = require("../controllers/categoryController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

// /api/categories

router
  .route("/")
  .post(verifyToken, createCategory)
  .get(getAllCategories);

// /api/categories/:id
router.route("/:id").delete(verifyTokenAndAdmin, deleteCategory);

module.exports = router;
