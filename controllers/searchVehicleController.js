const axios = require("axios");
const cheerio = require("cheerio");

/**
 * @desc Search Vehicles
 * @route /api/vehicles
 * @method GET
 * @access public
 */

const searchVehicles = async (req, res) => {
  let vehicleLetters = [];
  let vehicleLettersTextContent = [];
  let vehicleTypes = [];
  let vehiclePlaces = [];
  try {
    let { data } = await axios.get("https://itp.gov.iq/carSearchn.php");
    let $ = await cheerio.load(data);
    $(
      "#block-gavias-batiz-content > div > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > select option"
    ).each((i, el) => {
      vehicleLetters.push($(el).val().trim());
    });
    $(
      "#block-gavias-batiz-content > div > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > select option"
    ).each((i, el) => {
      vehicleLettersTextContent.push($(el).text().trim());
    });
    $("#mySelect option").each((i, el) => {
      vehicleTypes.push($(el).val().trim());
    });
    $(
      "#block-gavias-batiz-content > div > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > select > option"
    ).each((i, el) => {
      vehiclePlaces.push($(el).val().trim());
    });

    res.json({
      vehicleTypes,
      vehicleLetters,
      vehiclePlaces,
      vehicleLettersTextContent,
    });
  } catch (error) {
    res.json({ message: error });
  }
};

module.exports = { searchVehicles };
