const fs = require("fs");
const path = require("path");
const {
  validateCreateBlog,
  Blog,
  validateUpdateBlog,
} = require("../models/Blog");
const { Comment } = require("../models/Comment");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**
 * @desc Create New Blog
 * @route /api/blogs
 * @method POST
 * @access private (only admin)
 */
const createBlog = async (req, res) => {
  // Validation for image
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }
  // Validation for data
  const { error } = validateCreateBlog(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // Upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  // Create a new blog and save it to DB
  const { title, description, category } = req.body;
  const blog = await Blog.create({
    title,
    description,
    category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  // Send response to the client
  res.status(201).json(blog);
  // Remove image from the server
  fs.unlinkSync(imagePath);
};

/**
 * @desc Get All Blogs
 * @route /api/blogs
 * @method GET
 * @access public
 */
const getAllBlogs = async (req, res) => {
  const BLOG_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let blogs;

  if (pageNumber) {
    blogs = await Blog.find()
      .skip((pageNumber - 1) * BLOG_PER_PAGE)
      .limit(BLOG_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  } else if (category) {
    blogs = await Blog.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  } else {
    blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  }
  res.status(200).json(blogs);
};

/**
 * @desc Get Single Blog
 * @route /api/blogs/:id
 * @method GET
 * @access public
 */
const getSingleBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id)
    .populate("user", ["-password"])
    .populate("comments");

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  res.status(200).json(blog);
};

/**
 * @desc Get Blogs Count
 * @route /api/blogs/count
 * @method GET
 * @access public
 */
const getBlogCount = async (req, res) => {
  const count = await Blog.count();
  res.status(200).json(count);
};

/**
 * @desc Delete Blog
 * @route /api/blogs/:id
 * @method DELETE
 * @access private (only admin)
 */
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate("user", ["-password"]);

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  await Blog.findByIdAndDelete(id);
  await cloudinaryRemoveImage(blog.image.publicId);

  // Delete all comments that belong to this post
  await Comment.deleteMany({ blogId: blog._id });
  res.status(200).json({ message: "Blog deleted successfully" });
};

/**
 * @desc Update Blog
 * @route /api/blogs/:id
 * @method PUT
 * @access private (only owner of the blog)
 */
const updateBlog = async (req, res) => {
  // Validation
  const { error } = validateUpdateBlog(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const blog = await Blog.findById(req.params.id);

  // Check if this blog belong to logged in user
  if (req.user.id !== blog.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed to access blog" });
  }

  // Update blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  // Send response to the client
  res.status(200).json(updatedBlog);
};

/**
 * @desc Update Blog Image
 * @route /api/blogs/update-image/:id
 * @method PUT
 * @access private (only owner of the blog)
 */
const updateBlogImage = async (req, res) => {
  // Validation

  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }
  const blog = await Blog.findById(req.params.id);

  // Check if this blog belong to logged in user
  if (req.user.id !== blog.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed to access blog" });
  }

  // Delete the old image
  await cloudinaryRemoveImage(blog.image.publicId);

  // Upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // Update the image field in the DB
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );
  // Send response to the client
  res.status(200).json(updatedBlog);

  // Remove image from the server
  fs.unlinkSync(imagePath);
};

/**
 * @desc Toggle Like
 * @route /api/blogs/like/:id
 * @method PUT
 * @access private (only logged in users)
 */

const toggleLike = async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: blogId } = req.params;
  let blog = await Blog.findById(blogId);

  const isBlogAlreadyLiked = blog.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isBlogAlreadyLiked) {
    blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }
  res.status(200).json(blog);
};
module.exports = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  getBlogCount,
  deleteBlog,
  updateBlog,
  updateBlogImage,
  toggleLike,
};
