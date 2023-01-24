const { Category, validateCreateCategory } = require("../models/Category");

/**
 * @desc Create New Category
 * @route /api/categories
 * @method POST
 * @access private (only admin)
 */
const createCategory = async (req, res) => {
  const { error } = validateCreateCategory(req.body);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
  }

  const category = await Category.create({
    title: req.body.title,
    user: req.user.id,
  });
  res.status(201).json(category);
};

/**
 * @desc Get All Categories
 * @route /api/categories
 * @method GET
 * @access public
 */
const getAllCategories = async (req, res) => {
  const categories = await Category.find().populate("user", ["-password"]);
  res.status(200).json(categories);
};

/**
 * @desc Delete Category
 * @route /api/categories/:id
 * @method DELETE
 * @access private (only admin)
 */
const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "Category deleted",
  });
};

module.exports = { createCategory, getAllCategories, deleteCategory };
