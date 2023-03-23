const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @desc register a new user
 * @route /api/auth/register
 * @method POST
 * @access public
 */

const register = async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, phoneNumber, password, adminRole, vehicleNumber } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findOne({ phoneNumber });

  if (user) {
    return res.status(400).json({ message: "هذا المستخدم مسجل بالفعل" });
  } else {
    try {
      await User.create({
        username,
        phoneNumber,
        password: hashedPassword,
        vehicleNumber,
        adminRole,
      });
      res.status(201).json({ message: "لقد سجلت بنجاح" });
    } catch (error) {
      res.json({ status: "error", error });
    }
  }
};

/**
 * @desc Login User
 * @route /api/auth/login
 * @method POST
 * @access public
 */
const login = async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { phoneNumber, password } = req.body;
  const user = await User.findOne({ phoneNumber });


  if (!user) {
    return res.status(400).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        vehicleNumber: user.vehicleNumber,
        adminRole: user.adminRole,
        phone: user.phone,
        fullAddress: user.fullAddress,
        floorNumber: user.floorNumber,
        flatNumber: user.flatNumber,
        note: user.note,
      },
      process.env.JWT_SECRET_KEY
    );
    return res.json({ token });
  } else {
    res.status(400).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  }
};

/**
 * @desc Admin Login
 * @route /api/auth/admin/login
 * @method POST
 * @access public
 */
const adminLogin = async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { phoneNumber, password } = req.body;
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(400).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid && user.adminRole) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        adminRole: user.adminRole,
        fullAddress: user.fullAddress,
        floorNumber: user.floorNumber,
        flatNumber: user.flatNumber,
        note: user.note,
      },
      process.env.JWT_SECRET_KEY
    );
    return res.json({ token });
  } else {
    res.status(400).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  }
};
module.exports = {
  register,
  login,
  adminLogin,
};
