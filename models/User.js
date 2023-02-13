const Joi = require("joi");
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 8, trim: true },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png",
        publicId: null,
      },
    },
    adminRole: { type: Boolean, required: true },
    fullAddress: { type: String, trim: true },
    floorNumber: { type: Number, trim: true },
    flatNumber: { type: Number, trim: true },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Blogs
UserSchema.virtual("blogs", {
  ref: "Blog",
  foreignField: "user",
  localField: "_id",
});

// Populate Orders
UserSchema.virtual("orders", {
  ref: "Order",
  foreignField: "user",
  localField: "_id",
});
// User Model
const User = mongoose.model("User", UserSchema);

// Validate Register User
function validateRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
    adminRole: Joi.boolean(),
  });
  return schema.validate(obj);
}

// Validate Login User
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// Validate Update User
function validateUpdateUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100),
    password: Joi.string().trim().min(8),
    adminRole: Joi.boolean(),
    fullAddress: Joi.string().trim(),
    floorNumber: Joi.number(),
    flatNumber: Joi.number(),
    note: Joi.string().trim(),

  });
  return schema.validate(obj);
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
