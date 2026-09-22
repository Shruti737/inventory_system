const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

/**
 * Sequelize associations.
 *
 * User  1 -> many Orders
 * Order 1 -> many OrderItems
 * Product 1 -> many OrderItems
 */
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// A product referenced by an order cannot be deleted (RESTRICT), which keeps
// order history intact. The product controller returns a 409 in that case.
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'RESTRICT' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
};