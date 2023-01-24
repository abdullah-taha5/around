const router = require("express").Router();
const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  getBlogCount,
  deleteBlog,
  updateBlog,
  updateBlogImage,
  toggleLike,
} = require("../controllers/blogsController");
const { photoUpload } = require("../middlewares/photoUpload");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

// /api/blogs
router
  .route("/")
  .post(verifyTokenAndAdmin, photoUpload.single("image"), createBlog)
  .get(getAllBlogs);

// /api/blogs/count
router.route("/count").get(getBlogCount);

// /api/blogs/:id
router
  .route("/:id")
  .get(getSingleBlog)
  .delete(verifyToken, deleteBlog)
  .put(verifyToken, updateBlog);

// /api/blogs/update-image/:id
router
  .route("/update-image/:id")
  .put(verifyToken, photoUpload.single("image"), updateBlogImage);

// /api/blogs/like/:id
router.route("/like/:id").put(verifyToken, toggleLike);
module.exports = router;
