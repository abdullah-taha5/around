const {
  OrderPayFineReceipt,
  validateCreateOrderPayFine,
  PayReceipt,
} = require("../models/Order");
const Pusher = require("pusher");
const jwt = require("jsonwebtoken");
const cloudscraper = require("cloudscraper");
const {
  NotificationAdmin,
  NotificationsDriver,
  NotificationsClient,
} = require("../models/Notifications");

/**
 * @desc Create New Order pay receipt
 * @route /api/orders/pay-receipt
 * @method POST
 * @access public
 */
const createOrderPayReceipt = async (req, res) => {
  PayReceipt.findOneAndUpdate(
    { orderId: "autoval" },
    { $inc: { seq: 1 } },
    { new: true },
    async (err, cd) => {
      let seqId;
      if (cd == null) {
        const newVal = new PayReceipt({ orderId: "autoval", seq: 1 });
        newVal.save();
        seqId = 1;
      } else {
        seqId = cd.seq;
      }
      // Validation for image
      if (!req.files) {
        return res.status(400).json({ message: "No images provided" });
      }
      // Validation for data
      const { error } = validateCreateOrderPayFine(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Create a new order and save it to DB

      const { driver, amount, vehicleNumber, receiptNumber, dateFine } =
        req.body;
      const order = await OrderPayFineReceipt.create({
        user: req.user.id,
        driver,
        orderId: seqId,
        amount,
        vehicleNumber,
        receiptNumber,
        dateFine,
        fineReceipt: req.files[0].filename,
        annual: req.files[1].filename,
      });

      // Send response to the client
      await res.status(201).json(order);

      NotificationAdmin.create({
        notification: `The new order #${seqId} is a fine receipt`,
      });
      const pusher = new Pusher({
        appId: "1560841",
        key: "bc4967bba1165cd99700",
        secret: "d5ed6309cd0cd59cc7d0",
        cluster: "eu",
        useTLS: true,
      });

      pusher.trigger("my-channel", "notifications-admin", {
        message: `The new order #${seqId} is a fine receipt`,
      });
    }
  );
};

/**
 * @desc Get All Orders pay receipt
 * @route /api/order-pay-receipt
 * @method GET
 * @access private (only admin)
 */
const getAllOrdersPayReceipt = async (req, res) => {
  const ORDER_PER_PAGE = 10;
  const { pageNumber } = req.query;
  try {
    const orders = await OrderPayFineReceipt.find()
     .skip((pageNumber - 1) * ORDER_PER_PAGE)
      .limit(ORDER_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("driver", ["-password"]);
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
  }
};
/**
 * @desc Get Blogs Count
 * @route /api/order-pay-receipt/count
 * @method GET
 * @access public
 */
const getOrdersByReceiptsCount = async (req, res) => {
  const count = await OrderPayFineReceipt.count();
  res.status(200).json(count);
};
/**
 * @desc Get Single Order Pay Receipt
 * @route /api/order-pay-receipt/:id
 * @method GET
 * @access private (only admin and client and driver assigned)
 */

const getSingleOrderPayReceipt = async (req, res) => {
  const order = await OrderPayFineReceipt.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
};

/**
 * @desc Delete Order Pay Receipt
 * @route /api/order-pay-receipt/:id
 * @method DELETE
 * @access private (only admin)
 */
const deleteOrderPayReceipt = async (req, res) => {
  const { id } = req.params;
  const order = await OrderPayFineReceipt.findById(id).populate("user", [
    "-password",
  ]);

  if (!order) {
    return res.status(404).json({ message: "Blog not found" });
  }
  await OrderPayFineReceipt.findByIdAndDelete(id);

  res.status(200).json({ message: "Order deleted successfully" });
};

/**
 * @desc Assign Driver
 * @route /api/order-pay-receipt/:id
 * @method PUT
 * @access private (only admin)
 */
const assignDriver = async (req, res) => {
  // Assign Order
  const assignedDriver = await OrderPayFineReceipt.findByIdAndUpdate(
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
  NotificationsDriver.create({
    driver: req.body.driver,
    notification: req.body.notification,
  });
  const pusher = new Pusher({
    appId: "1560841",
    key: "bc4967bba1165cd99700",
    secret: "d5ed6309cd0cd59cc7d0",
    cluster: "eu",
    useTLS: true,
  });
  await pusher.trigger("my-channel", "notifications-driver", {
    message: req.body.notification,
    driver: req.body.driver,
  });

  res.status(200).json(assignedDriver);
};

/**
 * @desc Pay Order
 * @route /api/order-pay-receipt/pay/:id
 * @method GET
 * @access public
 */

const payOrder = async (req, res) => {
  const initUrl = "https://test.zaincash.iq/transaction/init";
  const requestUrl = "https://test.zaincash.iq/transaction/pay?id=";
  const order = await OrderPayFineReceipt.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  jwt.sign(
    {
      amount: order.amount,
      serviceType: "pay order by receipt",
      msisdn: process.env.MSISDN,
      orderId: req.params.id,
      redirectUrl: "https://project-stackdeans.netlify.app/user/orders-by-receipts",
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
          const operationId = JSON.parse(body).id;

          res
            .status(200)
            .json({ urlPay: requestUrl + operationId, operationId });
        })
        .catch((error) => {
          res.json({ message: error });
        });
    }
  );
};

/**
 * @desc Update Payment Status Order
 * @route /api/order-pay-receipt/status
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
      console.log(err);
    }
    if (decoded.status == "success") {
      const paymentStatus = await OrderPayFineReceipt.findByIdAndUpdate(
        decoded.orderid,
        { $set: { paymentStatus: decoded.status } },
        { new: true }
      );
      res.json(paymentStatus);
    }
  }
};

/**
 * @desc Update Driver Receipt
 * @route /api/order-pay-receipt/driver-receipt/:id
 * @method PUT
 * @access private (only driver)
 */
const updateDriverReceipt = async (req, res) => {
  // Validation for image
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  const newReceiptUpload = await OrderPayFineReceipt.findByIdAndUpdate(
    req.params.id,
    { $set: { driverReceipt: req.file.filename } },
    { new: true }
  );
  NotificationsClient.create({
    user: req.body.user,
    notification: req.body.notification,
  });
  const pusher = new Pusher({
    appId: "1560841",
    key: "bc4967bba1165cd99700",
    secret: "d5ed6309cd0cd59cc7d0",
    cluster: "eu",
    useTLS: true,
  });

  await pusher.trigger("my-channel", "notifications-client", {
    message: req.body.notification,
    user: req.body.user,
  });
  res.json(newReceiptUpload);
};

module.exports = {
  createOrderPayReceipt,
  getAllOrdersPayReceipt,
  getSingleOrderPayReceipt,
  deleteOrderPayReceipt,
  assignDriver,
  payOrder,
  updatePaymentStatus,
  updateDriverReceipt,
  getOrdersByReceiptsCount
};
