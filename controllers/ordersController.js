const { Order, validateCreateOrder, counterModel } = require("../models/Order");
const jwt = require("jsonwebtoken");
const cloudscraper = require("cloudscraper");
const {
  NotificationsDriver,
  NotificationAdmin,
  NotificationsClient,
} = require("../models/Notifications");
const Pusher = require("pusher");
const puppeteer = require("puppeteer");
const locateChrome = require('locate-chrome');
/**
 * @desc Create New Order
 * @route /api/orders
 * @method POST
 * @access public
 */
const createOrder = async (req, res) => {
  // Counter Order Id
  counterModel.findOneAndUpdate(
    { orderId: "autoval" },
    { $inc: { seq: 1 } },
    { new: true },
    async (err, cd) => {
      let seqId;
      if (cd == null) {
        const newVal = new counterModel({ orderId: "autoval", seq: 1 });
        newVal.save();
        seqId = 1;
      } else {
        seqId = cd.seq;
      }

      // Create a new order and save it to DB
      const { driver, total } = req.body;
      const order = await Order.create({
        user: req.user.id,
        driver,
        amount: total,
        orderId: seqId,
      });

      // Send response to the client
      await res.status(201).json(order);

      NotificationAdmin.create({ notification: `طلب جديد #${seqId}` });
      const pusher = new Pusher({
        appId: "1560841",
        key: "bc4967bba1165cd99700",
        secret: "d5ed6309cd0cd59cc7d0",
        cluster: "eu",
        useTLS: true,
      });

      pusher.trigger("my-channel", "notifications-admin", {
        message: `طلب جديد #${seqId}`,
      });
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
  const ORDER_PER_PAGE = 10;
  const { pageNumber } = req.query;
  const orders = await Order.find()
    .skip((pageNumber - 1) * ORDER_PER_PAGE)
    .limit(ORDER_PER_PAGE)
    .sort({ createdAt: -1 })
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  res.status(200).json(orders);
};

/**
 * @desc Get Blogs Count
 * @route /api/orders/count
 * @method GET
 * @access public
 */
const getOrdersCount = async (req, res) => {
  const count = await Order.count();
  res.status(200).json(count);
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
    return res.status(404).json({ message: "الطلب غير موجود" });
  }
  res.status(200).json(order);
};

/**
 * @desc Search Order
 * @route /api/orders/search
 * @method GET
 * @access public
 */
const searchOrder = async (req, res) => {
  (async () => {
    const executablePath = await new Promise(resolve => locateChrome(arg => resolve(arg)));
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath,
    });


    const page = await browser.newPage();
    await page.goto("https://itp.gov.iq/carSearchn.php");

    await page.select('select[name="CarLetter"]', req.body.vehicleLetter);
    await page.type('input[type="text"]', req.body.vehicleNum);
    await page.select('select[name="CarReg"]', req.body.vehiclePlace);
    await page.select('select[name="CarType"]', req.body.vehicleType);
    await Promise.all([
      page.click('input[name="submit"]'),
      page.waitForNavigation(),
    ]);
    try {
      const tbodyHtml = await page.evaluate(() => {
        const tbody = document.querySelector(
          "#block-gavias-batiz-content > div > table.blueTable > tbody"
        );
        return tbody.innerHTML.trim().replace(/\n\t\t/g, " ");
      });
      const total = await page.$eval("#blink", (el) => el.textContent.trim());
      res.json({ tbodyHtml, total });
    } catch (error) {
      return res.status(404).json({ message: "البيانات المكتوبة خاطئة" });
    }

    await browser.close();
  })();
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
    return res.status(404).json({ message: "الطلب غير موجود" });
  }
  await Order.findByIdAndDelete(id);

  res.status(200).json({ message: "تم حذف الطلب بنجاح" });
};
/**
 * @desc Multi Select Delete Orders
 * @route /api/orders
 * @method DELETE
 * @access private (only admin and delegate)
 */
const multiSelectDeleteOrder = async (req, res) => {
  await Order.deleteMany({
    _id: {
      $in: req.body,
    },
  });

  res.status(200).json({ message: "حذف جميع الطلبات التي قمت بتحديدها" });
};
/**
 * @desc Update Payment Status Order
 * @route /api/orders/order/:id
 * @method PUT
 * @access private (only admin and delegate)
 */
const updatePaymentStatusByAdminAndDelegate = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndUpdate(
    id,
    { $set: { paymentStatus: req.body.status } },
    { new: true }
  );
  res.json(order);
};
/**
 * @desc Update Amount Order
 * @route /api/orders/order/update/:id
 * @method PUT
 * @access private (only delegate)
 */
const updateAmountOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndUpdate(
    id,
    { $set: { amount: req.body.amount } },
    { new: true }
  );
  res.json(order);
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
 * @route /api/orders
 * @method PUT
 * @access private (only admin)
 */
const multiSelectAssignDelegate = async (req, res) => {
  // Assign Delegate

  const assignedDriver = await Order.updateMany(
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
 * @desc Update Order Status
 * @route /api/orders/order-status/:id
 * @method PUT
 * @access private (only admin)
 */
const orderStatus = async (req, res) => {
  // Update Order Status
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        orderStatus: req.body.orderStatus,
      },
    },
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
  res.status(200).json(order);
};

/**
 * @desc Pay Order
 * @route /api/orders/pay/:id
 * @method GET
 * @access public
 */

const payOrder = async (req, res) => {
  const initUrl = `https://${process.env.NODE_ENV === "development" ? "test.zaincash.iq" : "api.zaincash.iq"}/transaction/init`;
  const requestUrl = `https://${process.env.NODE_ENV === "development" ? "test.zaincash.iq" : "api.zaincash.iq"}/transaction/pay?id=`;
  const order = await Order.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("driver", ["-password"]);
  jwt.sign(
    {
      amount: order.amount,
      serviceType: "pay order",
      msisdn: process.env.MSISDN,
      orderId: req.params.id,
      redirectUrl: `${process.env.DOMAIN}/user/orders`,
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
          const err = JSON.parse(body).err;

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
      console.log(err);
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
  orderStatus,
  searchOrder,
  getOrdersCount,
  updatePaymentStatusByAdminAndDelegate,
  multiSelectAssignDelegate,
  multiSelectDeleteOrder,
  updateAmountOrder
};
