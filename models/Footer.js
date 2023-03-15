const mongoose = require("mongoose");

const FooterSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
    fax: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Footer = mongoose.model("Footer", FooterSchema);

module.exports = {
  Footer,
};
