const mongoose = require("mongoose");

// Commission On Orders
const CommissionSchema = mongoose.Schema(
  {
    commission: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Commission = mongoose.model("Commission", CommissionSchema);

// Commission By Receipts

const CommissionByReceiptsSchema = mongoose.Schema(
  {
    commission: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

const CommissionByReceipts = mongoose.model("CommissionByReceipts", CommissionByReceiptsSchema);

module.exports = {
  Commission,
  CommissionByReceipts
};
