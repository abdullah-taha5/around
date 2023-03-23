const {
  NotificationsClient,
  NotificationAdmin,
  NotificationsDriver,
} = require("../models/Notifications");

/**
 * @desc Get All Notification Admin
 * @route /api/notifications
 * @method GET
 * @access private (only admin)
 */
const getNotificationsAdmin = async (req, res) => {
  const notifications = await NotificationAdmin.find().sort({ createdAt: -1 });
  res.status(200).json(notifications);
};

/**
 * @desc Delete All Notification Admin
 * @route /api/notifications
 * @method DELETE
 * @access public
 */

const deleteNotificationsAdmin = async (req, res) => {
  await NotificationAdmin.deleteMany();
  res.status(200).json({ message: "Nتم حذف الإشعارات بنجاح" });
};

/**
 * @desc Delete All Notification Client
 * @route /api/notifications/client
 * @method DELETE
 * @access public
 */

const deleteNotificationsClient = async (req, res) => {
  await NotificationsClient.deleteMany({ user: req.user.id });
  res.status(200).json({ message: "تم حذف الإشعارات بنجاح" });
};
/**
 * @desc Viewed Notification Client
 * @route /api/notifications/client
 * @method PUT
 * @access private (only client)
 */

const viewedNotificationsClient = async (req, res) => {
  await NotificationsClient.updateMany(
    { user: req.user.id },
    { $set: { view: 1 } },
    { new: true }
  );
};
/**
 * @desc Delete All Notification Driver
 * @route /api/notifications/driver
 * @method DELETE
 * @access public
 */

const deleteNotificationsDriver = async (req, res) => {
  await NotificationsDriver.deleteMany({ driver: req.user.id });
  res.status(200).json({ message: "تم حذف الإشعارات بنجاح" });
};

/**
 * @desc Viewed Notification Driver
 * @route /api/notifications/driver
 * @method PUT
 * @access private (only driver)
 */

const viewedNotificationsDriver = async (req, res) => {
  await NotificationsDriver.updateMany(
    { user: req.user.id },
    { $set: { view: 1 } },
    { new: true }
  );
};
module.exports = {
  getNotificationsAdmin,
  deleteNotificationsAdmin,
  deleteNotificationsClient,
  deleteNotificationsDriver,
  viewedNotificationsClient,
  viewedNotificationsDriver
};
