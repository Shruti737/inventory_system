const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createProductValidator,
  updateProductValidator,
} = require('../validators/productValidator');

const router = express.Router();

// Create a product
router.post('/', createProductValidator, createProduct);

// List products (search, category, inStock, pagination)
router.get('/', getProducts);

// Get one product
router.get('/:id', getProductById);

// Update a product (partial)
router.patch('/:id', updateProductValidator, updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;