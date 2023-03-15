const mongoose = require("mongoose");

const HeroSchema = mongoose.Schema(
  {
    h1: {
      type: String,
      trim: true,
    },
    spanOne: {
      type: String,
      trim: true,
    },
    spanTwo: {
      type: String,
      trim: true,
    },
    background: {
      type: Object,
      default: {
        url: "",
      },
      required: true,
    },
  },
  { timestamps: true }
);

const Hero = mongoose.model("Hero", HeroSchema);

module.exports = {
  Hero,
};
