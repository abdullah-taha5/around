const {
  Driver,
  validateRegisterDriver,
  validateLoginDriver,
  validateUpdateDriver,
} = require("../models/Driver");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");


/**
 * @desc register a new driver
 * @route /api/driver/register
 * @method POST
 * @access public
 */

const registerDriver = async (req, res) => {
  const { error } = validateRegisterDriver(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, phoneNumber, password, vehicle, vehicleNumber, vehicleColor } =
    req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const driver = await Driver.findOne({ phoneNumber });

  if (driver) {
    return res.status(400).json({ message: "تم إضافة هذا المندوب بالفعل" });
  } else {
    try {
      await Driver.create({
        username,
        phoneNumber,
        password: hashedPassword,
        vehicle,
        vehicleNumber,
        vehicleColor,
      });
      res.status(201).json({ message: "قمت بإضافة مندوب" });
    } catch (error) {
      res.json({ status: "error", error });
    }
  }
};

/**
 * @desc Login Driver
 * @route /api/driver/login
 * @method POST
 * @access public
 */
const loginDriver = async (req, res) => {
  const { error } = validateLoginDriver(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { phoneNumber, password } = req.body;
  const driver = await Driver.findOne({ phoneNumber });

  if (!driver) {
    return res.status(400).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  }

  const isPasswordValid = await bcrypt.compare(password, driver.password);

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        id: driver._id,
        username: driver.username,
        phoneNumber: driver.phoneNumber,
        profilePhoto: driver.profilePhoto,
        vehicle: driver.vehicle,
        vehicleNumber: driver.vehicleNumber,
        vehicleColor: driver.color,
      },
      process.env.JWT_SECRET_KEY
    );
    return res.json({ token });
  } else {
    res.status(400).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  }
};
/**
 * @desc Get All Drivers Profile
 * @route /api/driver/profile
 * @method GET
 * @access private (only admin)
 */

const getAllDrivers = async (req, res) => {
  const drivers = await Driver.find()
    .select("-password")
    .populate("orders")
    .populate("notificationsDriver");
  res.status(200).json(drivers);
};
/**
 * @desc Get Driver Profile
 * @route /api/driver
 * @method GET
 * @access private (only driver)
 */

const getDriver = async (req, res) => {
  const driver = await Driver.findById(req.user.id)
    .select("-password")
    .populate({
      path: "orders",
      populate: {
        path: "user",
        select: "-password",
      },
    }).populate({
      path: "ordersByReceipts",
      populate: {
        path: "user",
        select: "-password",
      },
    })
    .populate("notificationsDriver");
  res.status(200).json(driver);
};
/**
 * @desc Delete Driver Profile
 * @route /api/driver/profile/:id
 * @method DELETE
 * @access private (only admin)
 */
const deleteDriverProfile = async (req, res) => {
  // Delete the user
  await Driver.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "تم حذف المندوب" });
};

/**
 * @desc Update Driver Profile
 * @route /api/driver/profile/:id
 * @method PUT
 * @access private (only user himself)
 */

const updateDriverProfile = async (req, res) => {
  const { error } = validateUpdateDriver(req.body);
  if (error) {
    return res.status(401).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  const { id } = req.params;
  const updatedDriver = await Driver.findByIdAndUpdate(
    id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
      },
    },
    { new: true }
  ).select("-password");
  res.status(200).json(updatedDriver);
};

/**
 * @desc Profile Photo Upload
 * @route /api/driver/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
 */

const profilePhotoUpload = async (req, res) => {
  // Validation
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم تقديم أي صورة" });
  }

  // Get the user from DB
  const driver = await Driver.findById(req.user.id);

  // Change the profilePhoto field in the DB
  driver.profilePhoto = {
    url: req.file.filename,
  };
  await driver.save();
  // Send response to client
  res.status(200).json({
    message: "تم تحميله بنجاح",
    profilePhoto: { url: req.file.filename },
  });
};

module.exports = {
  registerDriver,
  loginDriver,
  getAllDrivers,
  deleteDriverProfile,
  updateDriverProfile,
  profilePhotoUpload,
  getDriver,
};
