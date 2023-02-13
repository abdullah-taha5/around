const mongoose = require("mongoose");
const Joi = require("joi");

const OrderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null
    },
    orderId: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

const counterSchema = {
  orderId: {
    type: String
  },
  seq: {
    type: Number
  }
}

const counterModel = mongoose.model("counterOrders", counterSchema);

//Validate Create Order
function validateCreateOrder(obj) {
  const schema = Joi.object({
    amount: Joi.number().required(),
    paymentStatus: Joi.string().trim(),
  });
  return schema.validate(obj);
}



module.exports = {
  Order,
  counterModel,
  validateCreateOrder,
};
