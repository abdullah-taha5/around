const router = require("express").Router();
const {
  createComment,
  getAllComments,
  deleteComment,
  updateComment,
} = require("../controllers/commentsController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

// /api/comments
router
  .route("/")
  .post(verifyToken, createComment)
  .get(getAllComments);


// /api/comments/:id
router.route("/:id").delete(verifyTokenAndAdmin, deleteComment).put(verifyToken, updateComment);
module.exports = router;
