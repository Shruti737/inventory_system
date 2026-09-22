const { Order, OrderItem, Product } = require('../models');
const sequelize = require('../config/database');

/**
 * POST /api/orders
 * Creates an order for the authenticated user inside a database transaction.
 *
 * Steps (all inside the transaction):
 *   1. Load all requested products.
 *   2. Validate that every product exists.
 *   3. Validate that enough stock is available.
 *   4. Calculate the total on the server.
 *   5. Create the Order.
 *   6. Create the OrderItems (storing the price at purchase time).
 *   7. Reduce product stock.
 *   8. Commit – or rollback everything if any step fails.
 */
const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { items } = req.body;
    const userId = req.user.id;

    // 1. Load every requested product (inside the transaction).
    const productIds = items.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction,
    });

    // 2. Make sure all requested products exist.
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.productId} not found.`,
        });
      }
    }

    // 3. Check stock availability for every item before making any change.
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (product.stockQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}.`,
        });
      }
    }

    // 4. Calculate the total on the backend (never trust the client).
    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      const price = Number(product.price);
      totalAmount += price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price, // price snapshot at purchase time
      };
    });

    // 5. Create the order.
    const order = await Order.create(
      {
        userId,
        totalAmount,
        status: 'pending',
      },
      { transaction }
    );

    // 6. Create the order items.
    const orderItems = await OrderItem.bulkCreate(
      orderItemsData.map((data) => ({ ...data, orderId: order.id })),
      { transaction }
    );

    // 7. Reduce the stock for each product.
    for (const item of items) {
      const product = productMap.get(item.productId);
      product.stockQuantity -= item.quantity;
      await product.save({ transaction });
    }

    // 8. Commit – only now are the changes persisted.
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: {
        ...order.toJSON(),
        items: orderItems,
      },
    });
  } catch (error) {
    // Roll back everything if anything went wrong.
    if (!transaction.finished) {
      await transaction.rollback();
    }
    return next(error);
  }
};

/**
 * GET /api/orders
 * Returns only the authenticated user's orders with their items.
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'category'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/orders/:id
 * Returns a single order only if it belongs to the authenticated user.
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'category'],
            },
          ],
        },
      ],
    });

    // Not found or belongs to another user – never reveal the difference.
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createOrder, getOrders, getOrderById };