const { Order, validateCreateOrder, counterModel } = require("../models/Order");
const jwt = require("jsonwebtoken");
const cloudscraper = require("cloudscraper");

/**
 * @desc Create New Order
 * @route /api/orders
 * @method POST
 * @access public
 */
const createOrder = async (req, res) => {
  // Validation for data
  const { error } = validateCreateOrder(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Counter Order Id
  counterModel.findOneAndUpdate(
    { orderId: "autoval" },
    { $inc: { seq: 1 } },
    { new: true },
    (err, cd) => {
      let seqId;
      if (cd == null) {
        const newVal = new counterModel({ orderId: "autoval", seq: 1 });
        newVal.save();
        seqId = 1;
      } else {
        seqId = cd.seq;
      }
      // Create a new order and save it to DB
      const { driver, amount } = req.body;
      const order = Order.create({
        user: req.user.id,
        driver,
        amount,
        orderId: seqId,
      });
      // Send response to the client
      res.status(201).json({ message: "Created order successfully" });
    }
  );
};

/**
 * @desc Get All Orders
 * @route /api/orders
 * @method GET
 * @access private (only admin)
 */

const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  res.status(200).json(orders);
};

/**
 * @desc Get Single Order
 * @route /api/orders/:id
 * @method GET
 * @access private (only admin)
 */

const getSingleOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
};

/**
 * @desc Delete Order
 * @route /api/orders/:id
 * @method DELETE
 * @access private (only admin)
 */
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate("user", ["-password"]);

  if (!order) {
    return res.status(404).json({ message: "Blog not found" });
  }
  await Order.findByIdAndDelete(id);

  res.status(200).json({ message: "Order deleted successfully" });
};

/**
 * @desc Assign Driver
 * @route /api/orders/:id
 * @method PUT
 * @access private (only admin)
 */
const assignDriver = async (req, res) => {
  // Assign Order
  const assignedDriver = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        driver: req.body.driver,
      },
    },
    { new: true }
  )
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);

  res.status(200).json(assignedDriver);
};

/**
 * @desc Pay Order
 * @route /api/orders/pay/:id
 * @method GET
 * @access public
 */

const payOrder = async (req, res) => {
  const initUrl = "https://test.zaincash.iq/transaction/init";
  const requestUrl = "https://test.zaincash.iq/transaction/pay?id=";
  const order = await Order.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  jwt.sign(
    {
      amount: order.amount,
      serviceType: "pay order",
      msisdn: process.env.MSISDN,
      orderId: req.params.id,
      redirectUrl: "https://around-app.netlify.app/user/orders/",
    },
    process.env.SECRET,
    {
      expiresIn: "4h",
    },
    function (err, token) {
      cloudscraper
        .post({
          uri: initUrl,
          formData: {
            token: token,
            merchantId: process.env.MERCHANTID,
            lang: process.env.LANG,
          },
        })
        .then((body) => {
          //  Getting the operation id
          const OperationId = JSON.parse(body).id;

          res.status(200).json({ urlPay: requestUrl + OperationId });
        })
        .catch((error) => {
          res.json({ message: error });
        });
    }
  );
};

/** * @desc Update Payment Status Order
 * @route /api/orders/pay/status
 * @method PUT
 * @access public
 */
const updatePaymentStatus = async (req, res) => {
  const token = req.query.token;
  if (token) {
    try {
      var decoded = jwt.verify(token, process.env.SECRET); // Use the same secret
    } catch (err) {
      // err
    }
    if (decoded.status == "success") {
      const paymentStatus = await Order.findByIdAndUpdate(
        decoded.orderid,
        { $set: { paymentStatus: decoded.status } },
        { new: true }
      );
      res.json(paymentStatus);
    }
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteOrder,
  assignDriver,
  payOrder,
  updatePaymentStatus,
};
