const { Order, validateCreateOrder, counterModel } = require("../models/Order");
const jwt = require("jsonwebtoken");
const cloudscraper = require("cloudscraper");
const { NotificationsDriver, NotificationAdmin, NotificationsClient } = require("../models/Notifications");
const Pusher = require("pusher");
<<<<<<< Updated upstream
const puppeteer = require("puppeteer-core");
const {executablePath} = require('puppeteer')
=======
const puppeteer = require('puppeteer');
>>>>>>> Stashed changes

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
     
      NotificationAdmin.create({ notification: `New Order #${seqId}` });
      const pusher = new Pusher({
        appId: "1560841",
        key: "bc4967bba1165cd99700",
        secret: "d5ed6309cd0cd59cc7d0",
        cluster: "eu",
        useTLS: true,
      });

      pusher.trigger("my-channel", "notifications-admin", {
        message: `New Order #${seqId}`,
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
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
};

/**
 * @desc Search Order
 * @route /api/orders/search/order
 * @method POST
 * @access public
 */
const searchOrder = async (req, res) => {
  (async () => {
<<<<<<< Updated upstream
    const browser = await puppeteer.launch({ 
    args: ['--no-sandbox',],
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath: executablePath(),
    });
=======

    const browser = await puppeteer.launch({ 
      headless: false,
	args: [
		// Required for Docker version of Puppeteer
		'--no-sandbox',
		'--disable-setuid-sandbox',
		// This will write shared memory files into /tmp instead of /dev/shm,
		// because Docker’s default for /dev/shm is 64MB
		'--disable-dev-shm-usage',
	]
   });
>>>>>>> Stashed changes
    const page = await browser.newPage();
    await page.goto("https://itp.gov.iq/carSearch.php");

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
      return res.status(404).json({ message: "Inserted data is wrong" });
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
      redirectUrl: "https://around-app.netlify.app/user/orders",
    },
    process.env.SECRET,
    {
      expiresIn: '4h'
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
  getOrdersCount
};
