const mongoose = require("mongoose");
const Joi = require("joi");

const BlogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Comment For This Blog
BlogSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "blogId",
  localField: "_id",
});
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

// Validate Create Blog
function validateCreateBlog(obj) {
  const scheme = Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().min(10).required(),
    category: Joi.string().trim().required(),
  });
  return scheme.validate(obj);
}

// Validate Update Blog
function validateUpdateBlog(obj) {
  const scheme = Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().trim().min(10),
    category: Joi.string().trim(),
  });
  return scheme.validate(obj);
}
module.exports = { Blog, validateCreateBlog, validateUpdateBlog };
