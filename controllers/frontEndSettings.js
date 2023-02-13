const fs = require("fs");
const path = require("path");
const {
  FrontEndSettings,
  validateChangeFrontEnd,
  validateUpdateFrontEnd,
} = require("../models/FrontEndSettings");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**
 * @desc Change Front End => Section Hero
 * @route /api/section/hero
 * @method PUT
 * @access private (only admin)
 */
const changeSectionHero = async (req, res) => {
  // Validation for data
  const { error } = validateChangeFrontEnd(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // Upload Background Image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  // Change Section Hero and save it to DB
  const { h1, spanOne, spanTwo, button } = req.body;
  const sectionHero = await FrontEndSettings.create({
    homePage: {
      sectionHero: [
        {
          h1,
          spanOne,
          spanTwo,
          button,
          background: {
            url: result.secure_url,
            publicId: result.public_id,
          },
        },
      ],
    },
  });
  // Send response to the client
  res.status(201).json(sectionHero);
  // Remove image from the server
  fs.unlinkSync(imagePath);
};

/**
 * @desc Get Hero Section
 * @route /api/section/hero
 * @method GET
 * @access private (only admin)
 */
const getAllHeroSection = async (req, res) => {
  const heros = await FrontEndSettings.find().select("homePage.sectionHero");
  res.status(200).json(heros[heros.length - 1].homePage.sectionHero[0]);
};
module.exports = { changeSectionHero, getAllHeroSection };
