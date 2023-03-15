const { Hero } = require("../models/Hero");

/**
 * @desc Change Front End => Section Hero
 * @route /api/hero
 * @method POST
 * @access private (only admin)
 */
const changeSectionHero = async (req, res) => {
  // Change Section Hero and save it to DB
  const { h1, spanOne, spanTwo } = req.body;
  const sectionHero = await Hero.create({
    h1,
    spanOne,
    spanTwo,
    background: {
      url: req.file.filename,
    },
  });
  // Send response to the client
  res.status(201).json(sectionHero);
};

/**
 * @desc Get Hero Section
 * @route /api/hero
 * @method GET
 * @access public
 */

const getAllHeroSection = async (req, res) => {
  const heros = await Hero.find();
  res.status(200).json(heros[heros.length - 1]);
};
module.exports = { changeSectionHero, getAllHeroSection };
