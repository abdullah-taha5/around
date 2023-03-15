const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");
const {
  getNotificationsAdmin,
  deleteNotificationsAdmin,
  deleteNotificationsClient,
  deleteNotificationsDriver,
  viewedNotificationsClient,
  viewedNotificationsDriver,
} = require("../controllers/notificationsController.js");

// /api/notifications/client
router
  .route("/client")
  .delete(verifyToken, deleteNotificationsClient)
  .put(verifyToken, viewedNotificationsClient);

// /api/notifications/driver
router
  .route("/driver")
  .delete(verifyToken, deleteNotificationsDriver)
  .put(verifyToken, viewedNotificationsDriver);

// /api/notifications/admin
router
  .route("/admin")
  .get(verifyTokenAndAdmin, getNotificationsAdmin)
  .delete(verifyTokenAndAdmin, deleteNotificationsAdmin);

module.exports = router;
