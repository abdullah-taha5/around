const mongoose = require("mongoose");
const Joi = require("joi");

const DriverSchema = mongoose.Schema(
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
        publicId: null,
      },
    },
    vehicle: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleColor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Orders
DriverSchema.virtual("orders", {
  ref: "Order",
  foreignField: "driver",
  localField: "_id",
});
// Populate Orders By Receipts
DriverSchema.virtual("ordersByReceipts", {
  ref: "OrderPayFineReceipt",
  foreignField: "driver",
  localField: "_id",
});
// Populate Notifications
DriverSchema.virtual("notificationsDriver", {
  ref: "NotificationsDriver",
  foreignField: "driver",
  localField: "_id",
});
const Driver = mongoose.model("Driver", DriverSchema);

// Validate Register Driver
function validateRegisterDriver(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    phoneNumber: Joi.number().required(),
    password: Joi.string().trim().min(8).required(),
    vehicle: Joi.string().required(),
    vehicleNumber: Joi.string().required(),
    vehicleColor: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// Validate Login Driver
function validateLoginDriver(obj) {
  const schema = Joi.object({
    phoneNumber: Joi.number().required(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// Validate Update Driver
function validateUpdateDriver(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100),
    password: Joi.string().trim().min(8),
  });
  return schema.validate(obj);
}
module.exports = {
  Driver,
  validateRegisterDriver,
  validateLoginDriver,
  validateUpdateDriver,
};
