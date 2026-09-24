const { Op } = require('sequelize');
const { Product } = require('../models');

/**
 * POST /api/products
 * Create a new product.
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      category,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/products
 * Supports search, category filter, in-stock filter and pagination.
 *
 * Examples:
 *   /api/products?search=iphone
 *   /api/products?category=electronics
 *   /api/products?inStock=true
 *   /api/products?category=electronics&inStock=true&page=1&limit=10
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, inStock } = req.query;

    // Pagination defaults.
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = {};

    // Case-insensitive search by product name.
    if (search) {
  where[Op.or] = [
    { name: { [Op.iLike]: `%${search}%` } },
    { category: { [Op.iLike]: `%${search}%` } },
    { description: { [Op.iLike]: `%${search}%` } },
  ];
}

    // Filter by category (case-insensitive exact match).
    if (category) {
      where.category = { [Op.iLike]: category };
    }

    // Filter by availability.
    if (inStock === 'true') {
      where.stockQuantity = { [Op.gt]: 0 };
    } else if (inStock === 'false') {
      where.stockQuantity = 0;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/products/:id
 * Partial update of the provided fields only.
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const allowedFields = ['name', 'description', 'price', 'stockQuantity', 'category'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    // Handle foreign key constraint (product referenced by an order item).
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Product cannot be deleted because it is referenced by existing orders.',
      });
    }
    return next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};