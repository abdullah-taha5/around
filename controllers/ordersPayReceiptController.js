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
        return res.status(400).json({ message: "لا توجد صور مقدمة" });
      }
      // Validation for data
      const { error } = validateCreateOrderPayFine(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Create a new order and save it to DB

      const {
        driver,
        amount,
        vehicleNumber,
        receiptNumber,
        dateFine,
        timeFine,
      } = req.body;
      const order = await OrderPayFineReceipt.create({
        user: req.user.id,
        driver,
        orderId: seqId,
        amount,
        vehicleNumber,
        receiptNumber,
        dateFine,
        timeFine,
        fineReceipt: req.files[0].filename,
        annual: req.files[1].filename,
      });

      // Send response to the client
      await res.status(201).json(order);

      NotificationAdmin.create({
        notification: `طلب جديد عن طريق الدفع بالإيصال رقم الطلب #${seqId}`,
      });
      const pusher = new Pusher({
        appId: "1560841",
        key: "bc4967bba1165cd99700",
        secret: "d5ed6309cd0cd59cc7d0",
        cluster: "eu",
        useTLS: true,
      });

      pusher.trigger("my-channel", "notifications-admin", {
        message: `طلب جديد عن طريق الدفع بالإيصال رقم الطلب #${seqId}`,
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
    return res.status(404).json({ message: "لا يوجد طلب" });
  }
  res.status(200).json(order);
};
/**
 * @desc Update Order
 * @route /api/order-pay-receipt/update/:id
 * @method PUT
 * @access private (Delegate)
 */

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const updateOrder = await OrderPayFineReceipt.findByIdAndUpdate(
    id,
    {
      $set: {
        amount: req.body.amount,
        vehicleNumber: req.body.vehicleNumber,
        receiptNumber: req.body.receiptNumber,
      },
    },
    { new: true }
  );
  res.status(200).json(updateOrder);
};

/**
 * @desc Update Fine Receipt Order
 * @route /api/order-pay-receipt/fine-receipt/:id
 * @method PUT
 * @access private (Delegate)
 */

const updateFineReceipt = async (req, res) => {
  const { id } = req.params;

  if (req.file) {
    const updateOrder = await OrderPayFineReceipt.findByIdAndUpdate(
      id,
      {
        $set: {
          fineReceipt: req.file.filename,
        },
      },
      { new: true }
    );
    res.status(200).json(updateOrder);
  }
};

/**
 * @desc Update Annual Order
 * @route /api/order-pay-receipt/annual/:id
 * @method PUT
 * @access private (Delegate)
 */

const updateAnnual = async (req, res) => {
  const { id } = req.params;

  if (req.file) {
    const updateOrder = await OrderPayFineReceipt.findByIdAndUpdate(
      id,
      {
        $set: {
          annual: req.file.filename,
        },
      },
      { new: true }
    );
    res.status(200).json(updateOrder);
  }
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
    return res.status(404).json({ message: "لا يوجد طلب" });
  }
  await OrderPayFineReceipt.findByIdAndDelete(id);

  res.status(200).json({ message: "حذف الطلب بنجاح" });
};

/**
 * @desc Multi Select Delete Orders
 * @route /api/order-pay-receipt
 * @method DELETE
 * @access private (only admin and delegate)
 */
const multiSelectDeleteOrder = async (req, res) => {
  await OrderPayFineReceipt.deleteMany({
    _id: {
      $in: req.body,
    },
  });

  res.status(200).json({ message: "حذف جميع الطلبات التي قمت بتحديدها" });
};
/**
 * @desc Update Payment Status Order
 * @route /api/order-pay-receipt/order/:id
 * @method PUT
 * @access private (only admin and delegate)
 */
const updatePaymentStatusByAdminAndDelegate = async (req, res) => {
  const { id } = req.params;
  const order = await OrderPayFineReceipt.findByIdAndUpdate(
    id,
    { $set: { paymentStatus: req.body.status } },
    { new: true }
  );
  res.json(order);
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
 * @desc Multi Select Assign Delegate
 * @route /api/order-pay-receipt/
 * @method PUT
 * @access private (only admin)
 */
const multiSelectAssignDelegate = async (req, res) => {
  // Assign Delegate

  const assignedDriver = await OrderPayFineReceipt.updateMany(
    { _id: { $in: req.body.idsOrders } },
    { $set: { driver: req.body.driver } },
    { multi: true }
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
  const initUrl = `https://${process.env.NODE_ENV === "development" ? "test.zaincash.iq" : "api.zaincash.iq"}/transaction/init`;
  const requestUrl = `https://${process.env.NODE_ENV === "development" ? "test.zaincash.iq" : "api.zaincash.iq"}/transaction/pay?id=`;
  const order = await OrderPayFineReceipt.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  jwt.sign(
    {
      amount: order.amount,
      serviceType: "pay order by receipt",
      msisdn: process.env.MSISDN,
      orderId: req.params.id,
      redirectUrl: `${process.env.DOMAIN}/user/orders-by-receipts`,
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
    return res.status(400).json({ message: "لا يوجد صورة" });
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
  getOrdersByReceiptsCount,
  updatePaymentStatusByAdminAndDelegate,
  multiSelectAssignDelegate,
  multiSelectDeleteOrder,
  updateOrder,
  updateFineReceipt,
  updateAnnual
};
