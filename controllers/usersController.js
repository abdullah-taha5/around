const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");
const { Blog } = require("../models/Blog");
const { Comment } = require("../models/Comment");

/**
 * @desc Get All Users Profile
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
 */

const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password")
    .populate("blogs")
    .populate("orders");
  res.status(200).json(users);
};

/**
 * @desc Get User Profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
 */

const getUserProfile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id)
    .select("-password")
    .populate("blogs")
    .populate({
      path: "orders",
      populate: {
        path: "driver",
        select: "-password",
      },
    });
  if (user) {
    res.status(200).json(user);
  } else {
    return res.status(404).json({ message: "user not found" });
  }
};

/**
 * @desc Delete User Profile
 * @route /api/users/profile/:id
 * @method DELETE
 * @access private (only admin)
 */
const deleteUserProfile = async (req, res) => {
  const user = User.findById(req.params.id);

  // Get all blogs from DB
  const blogs = await Blog.find({ user: user._id });
  // Get the public ids from the blogs
  const publicIds = await blogs?.map((blog) => blog.image.publicId);

  // Delete all blogs image from cloudinary that belong to this user
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  // Delete user blogs & comments
  await Blog.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });
  // Delete the user
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User deleted successfully" });
};

/**
 * @desc Update User Profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
 */

const updateUserProfile = async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(401).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        adminRole: req.body.adminRole,
        fullAddress: req.body.fullAddress,
        floorNumber: req.body.floorNumber,
        flatNumber: req.body.flatNumber,
        note: req.body.note,
      },
    },
    { new: true }
  ).select("-password");
  res.status(200).json(updatedUser);
};

/**
 * @desc Profile Photo Upload
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
 */

const profilePhotoUpload = async (req, res) => {
  // Validation
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  // Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // Upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);

  // Get the user from DB
  const user = await User.findById(req.user.id);

  // Delete the old profile photo if exist
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // Change the profilePhoto field in the DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  // Send response to client
  res.status(200).json({
    message: "successfully uploaded",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  // Remove image from the server
  fs.unlinkSync(imagePath);
};
module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  profilePhotoUpload,
  deleteUserProfile,
};
