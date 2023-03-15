const mongoose = require("mongoose");

// Commission On Orders
const TermSchema = mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Term = mongoose.model("Term", TermSchema);

module.exports = {Term};