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

  const { username, email, password, adminRole } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ message: "This user already registered" });
  } else {
    try {
      await User.create({
        username,
        email,
        password: hashedPassword,
        adminRole,
      });
      res.status(201).json({ message: "You registered successfully" });
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

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
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
    res.status(400).json({ message: "Invalid email or password" });
  }
};

module.exports = {
  register,
  login,
};
