const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");


/**
 * @desc Get All Users Profile
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
 */

const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password")
    .populate("orders")
    .populate("notificationsClient");
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
  const ORDER_PER_PAGE = 10;
  const { pageNumber } = req.query;
  const user = await User.findById(id)
    .select("-password")
    .populate("notificationsClient")
    .populate({
      path: "orders",
      options: {
        sort: { createdAt: -1 },
      },
      populate: {
        path: "driver",
        select: "-password",
      },
   
    }).populate({
      path: "ordersByReceipts",
      options: {
        sort: { createdAt: -1 },
      },
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
        vehicleNumber: req.body.vehicleNumber,
        adminRole: req.body.adminRole,
        phone: req.body.phone,
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

 

  // Get the user from DB
  const user = await User.findById(req.user.id);

  // Change the profilePhoto field in the DB
  user.profilePhoto = {
    url: req.file.filename,
  };
  await user.save();
  // Send response to client
  res.status(200).json({
    message: "successfully uploaded",
    profilePhoto: { url: req.file.filename },
  });

};
module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  profilePhotoUpload,
  deleteUserProfile,
};
