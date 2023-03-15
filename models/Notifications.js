const mongoose = require("mongoose");

const NotificationsClientSchema = mongoose.Schema(
  {
    notification: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    view: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NotificationsClient = mongoose.model(
  "NotificationsClient",
  NotificationsClientSchema
);

const NotificationsDriverSchema = mongoose.Schema(
  {
    notification: {
      type: String,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
    view: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NotificationsDriver = mongoose.model(
  "NotificationsDriver",
  NotificationsDriverSchema
);

//  Notifications Admin Model
const NotificationsAdminSchema = mongoose.Schema(
  {
    notification: {
      type: String,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NotificationAdmin = mongoose.model(
  "NotificationAdmin",
  NotificationsAdminSchema
);

module.exports = {
  NotificationsClient,
  NotificationAdmin,
  NotificationsDriver,
};
