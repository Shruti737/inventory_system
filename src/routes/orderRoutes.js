const express = require('express');
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController');
const { createOrderValidator } = require('../validators/orderValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All order routes require a valid JWT.
router.use(protect);

// Create an order
router.post('/', createOrderValidator, createOrder);

// Get the authenticated user's orders
router.get('/', getOrders);

// Get one order (must belong to the authenticated user)
router.get('/:id', getOrderById);

module.exports = router;