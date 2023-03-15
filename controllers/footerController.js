const { Footer } = require("../models/Footer");

/**
 * @desc Change Front End => Section Footer
 * @route /api/footer
 * @method POST
 * @access private (only admin)
 */
const changeSectionFooter = async (req, res) => {
  // Change Section Footer and save it to DB
  const { email, phone, fax, address } = req.body;
  const footer = await Footer.create({
    email,
    phone,
    fax,
    address,
  });
  // Send response to the client
  res.status(201).json(footer);
};

/**
 * @desc Get Footer Section
 * @route /api/footer
 * @method GET
 * @access public
 */

const getFooterSection = async (req, res) => {
  const footers = await Footer.find();
  res.status(200).json(footers[footers.length - 1]);
};

module.exports = {
  changeSectionFooter,
  getFooterSection,
};
