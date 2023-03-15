const { Term } = require("../models/Term");

/**
 * @desc Create New Term
 * @route /api/term
 * @method POST
 * @access private (only admin)
 */
const createTerm = async (req, res) => {
  // Change commission and save it to DB
  const { term } = req.body;
  const newTerm = await Term.create({
    term,
  });
  // Send response to the client
  res.status(201).json(newTerm);
};

/**
 * @desc Get Term
 * @route /api/term
 * @method GET
 * @access public
 */

const getTerm = async (req, res) => {
  const terms = await Term.find();
  res.status(200).json(terms[terms.length - 1]);
};


module.exports = { createTerm, getTerm};
