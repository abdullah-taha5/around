const mongoose = require("mongoose");
const Joi = require("joi");

const FrontEndSettingsSchema = mongoose.Schema(
  {
    homePage: {
      sectionHero: [
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
          button: {
            type: String,
            trim: true,
          },
          background: {
            type: Object,
            default: {
              url: "",
              publicId: null,
            },
          },
        },
      ],
    },
  },
  { timestamps: true }
);

const FrontEndSettings = mongoose.model(
  "FrontEndSettings",
  FrontEndSettingsSchema
);

// Validate Change Front End
function validateChangeFrontEnd(obj) {
  const schema = Joi.object({
    h1: Joi.string().trim(),
    spanOne: Joi.string().trim(),
    spanTwo: Joi.string().trim(),
    button: Joi.string().trim(),
  });
  return schema.validate(obj);
}

module.exports = {
  FrontEndSettings,
  validateChangeFrontEnd,
};
