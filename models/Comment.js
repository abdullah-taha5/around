const mongoose = require("mongoose");
const Joi = require("joi");

const CommentSchema = mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

//Validate Create Comment
function validateCreateComment(obj) {
  const schema = Joi.object({
    blogId: Joi.string().required().label("blog id"),
    text: Joi.string().trim().required().label("text"),
  });
  return schema.validate(obj);
}

//Validate Update Comment
function validateUpdateComment(obj) {
  const schema = Joi.object({
    blogId: Joi.string(),
    text: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment,
};
