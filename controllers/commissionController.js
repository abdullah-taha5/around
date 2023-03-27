const { Commission, CommissionByReceipts } = require("../models/Commission");

/**
 * @desc Create New Commission
 * @route /api/commission
 * @method POST
 * @access private (only admin)
 */
const createCommission = async (req, res) => {
  // Change commission and save it to DB
  const { commission } = req.body;
  const newCommission = await Commission.create({
    commission,
  });
  // Send response to the client
  res.status(201).json(newCommission);
};

/**
 * @desc Get Commissions
 * @route /api/commission
 * @method GET
 * @access public
 */

const getCommissions = async (req, res) => {
  const commissions = await Commission.find();
  res.status(200).json(commissions[commissions.length - 1]);
};

/**
 * @desc Create New Commission By Receipts
 * @route /api/commission/receipts
 * @method POST
 * @access private (only admin)
 */
const createCommissionByReceipts = async (req, res) => {
  // Change commission and save it to DB
  const { commission, price } = req.body;
  const newCommission = await CommissionByReceipts.create({
    commission,
    price
  });
  // Send response to the client
  res.status(201).json(newCommission);
};

/**
 * @desc Get Commissions By Receipts
 * @route /api/commission/receipts/:price
 * @method GET
 * @access public
 */

const getCommissionByReceipts = async (req, res) => {
  const commissions = await CommissionByReceipts.find({price: req.params.price});
  res.status(200).json(commissions[commissions.length - 1]);
};

/**
 * @desc Get Commissions By Receipts
 * @route /api/commission/receipts-update
 * @method GET
 * @access public
 */

const getCommissionByReceiptsUpdate = async (req, res) => {
  const commissions = await CommissionByReceipts.find();
  res.status(200).json(commissions);
};
module.exports = { createCommission, getCommissions, createCommissionByReceipts, getCommissionByReceipts, getCommissionByReceiptsUpdate};
