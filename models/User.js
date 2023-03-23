const Joi = require("joi");
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    phoneNumber: { type: Number, required: true, trim: true },
    password: { type: String, required: true, minlength: 8, trim: true },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png",
      },
    },
    adminRole: { type: Boolean, required: true },
    vehicleNumber: { type: Number, trim: true },
    phone: { type: Number, trim: true },
    fullAddress: { type: String, trim: true },
    floorNumber: { type: Number, trim: true },
    flatNumber: { type: Number, trim: true },
    note: { type: String, trim: true },
    notifications: { type: Array },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Orders
UserSchema.virtual("orders", {
  ref: "Order",
  foreignField: "user",
  localField: "_id",
});
// Populate Orders By Receipts
UserSchema.virtual("ordersByReceipts", {
  ref: "OrderPayFineReceipt",
  foreignField: "user",
  localField: "_id",
});
// Populate Notifications
UserSchema.virtual("notificationsClient", {
  ref: "NotificationsClient",
  foreignField: "user",
  localField: "_id",
});

// User Model
const User = mongoose.model("User", UserSchema);

// Validate Register User
function validateRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    phoneNumber: Joi.number().required(),
    password: Joi.string().trim().min(8).required(),
    vehicleNumber: Joi.number(),
    adminRole: Joi.boolean(),
  });
  return schema.validate(obj);
}

// Validate Login User
function validateLoginUser(obj) {
  const schema = Joi.object({
    phoneNumber: Joi.number().required(),
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
    phone: Joi.number(),
    fullAddress: Joi.string().trim(),
    floorNumber: Joi.number(),
    flatNumber: Joi.number(),
    note: Joi.string().trim(),
    vehicleNumber: Joi.number(),

  });
  return schema.validate(obj);
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
