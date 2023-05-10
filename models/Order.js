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
      default: null,
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
    orderStatus: { type: String, default: "New" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

const counterSchema = {
  orderId: {
    type: String,
  },
  seq: {
    type: Number,
  },
};

const counterModel = mongoose.model("counterOrders", counterSchema);

//Validate Create Order
function validateCreateOrder(obj) {
  const schema = Joi.object({
    amount: Joi.number().required(),
    paymentStatus: Joi.string().trim(),
  });
  return schema.validate(obj);
}



//  pay a fine receipt
const FineReceiptSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
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
    vehicleNumber: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
    dateFine: {
      type: String,
    },
    timeFine: {
      type: String,
    },
    fineReceipt: {
      type: String,
      required: true,
    },
    driverReceipt: {
      type: String,
    },
    annual: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderPayFineReceipt = mongoose.model("OrderPayFineReceipt", FineReceiptSchema);

const counterOrdersPayReceiptSchema = {
  orderId: {
    type: String,
  },
  seq: {
    type: Number,
  },
};

const PayReceipt = mongoose.model("PayReceipt", counterOrdersPayReceiptSchema);


//Validate Create Order Pay your fine on behalf
function validateCreateOrderPayFine(obj) {
  const schema = Joi.object({
    amount: Joi.number().required(),
    paymentStatus: Joi.string().trim(),
    vehicleNumber: Joi.string().trim(),
    receiptNumber: Joi.string().trim(),
  });
  return schema.validate(obj);
}
module.exports = {
  Order,
  counterModel,
  validateCreateOrder,
  OrderPayFineReceipt,
  validateCreateOrderPayFine,
  PayReceipt
};
