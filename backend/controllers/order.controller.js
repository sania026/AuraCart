import asyncHandler from 'express-async-handler';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';
import { sendNotificationAndEmail } from '../utils/notificationHelper.js';

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
export const placeOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  // Validate stock before proceeding
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
    }
  }

  // Decrement stock and check for low stock alert triggers
  for (const item of orderItems) {
    const product = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (product && product.stock < 5) {
      await sendNotificationAndEmail({
        isAdmin: true,
        title: 'Low Stock Alert',
        message: `Inventory alert: Product "${product.name}" (${product.sku}) is running low on stock. Only ${product.stock} units remaining.`,
        type: 'stock_low',
        data: { productId: product._id },
      });
    }
  }

  // Create order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // Clear user's cart after successful order creation
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  // Trigger Notifications & Emails
  await sendNotificationAndEmail({
    user: req.user._id,
    email: req.user.email,
    subject: 'Order Confirmed - AuraCart',
    title: 'Order Placed Successfully',
    message: `Thank you for shopping at AuraCart! Your order #${createdOrder._id} has been placed successfully. Total amount: $${createdOrder.totalPrice.toFixed(2)}.`,
    type: 'order_placed',
    data: { orderId: createdOrder._id },
  });

  await sendNotificationAndEmail({
    isAdmin: true,
    title: 'New Order Received',
    message: `A new order #${createdOrder._id} was placed by ${req.user.name} for $${createdOrder.totalPrice.toFixed(2)}.`,
    type: 'order_placed',
    data: { orderId: createdOrder._id },
  });

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Limit access to order owner or admin user
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json(order);
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .sort({ createdAt: -1 });
  res.status(200).json(orders);
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!orderStatus || !validStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error('Please provide a valid order status');
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.orderStatus === 'Delivered') {
    res.status(400);
    throw new Error('Delivered orders cannot be updated further');
  }

  order.orderStatus = orderStatus;

  if (orderStatus === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();

  // Trigger notification on order status change
  let title = 'Order Status Updated';
  let message = `Your order #${order._id} status has been updated to: ${orderStatus}.`;
  let mailSubject = `Order #${order._id} Status Update`;
  let type = 'order_placed';

  if (orderStatus === 'Shipped') {
    title = 'Order Shipped';
    message = `Great news! Your order #${order._id} has been shipped and is on its way.`;
    mailSubject = `Your AuraCart Order #${order._id} has shipped!`;
    type = 'order_shipped';
  } else if (orderStatus === 'Delivered') {
    title = 'Order Delivered';
    message = `Your order #${order._id} has been delivered successfully. Thank you for shopping with us!`;
    mailSubject = `Your AuraCart Order #${order._id} has been delivered!`;
    type = 'order_delivered';
  } else if (orderStatus === 'Cancelled') {
    title = 'Order Cancelled';
    message = `Your order #${order._id} has been cancelled.`;
    mailSubject = `AuraCart Order #${order._id} Cancellation Confirmation`;
    type = 'order_cancelled';
  }

  await sendNotificationAndEmail({
    user: order.user._id,
    email: order.user.email,
    subject: mailSubject,
    title,
    message,
    type,
    data: { orderId: order._id },
  });

  res.status(200).json(updatedOrder);
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Limit access to order owner
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.orderStatus !== 'Pending') {
    res.status(400);
    throw new Error(`Cannot cancel order. Current status: ${order.orderStatus}`);
  }

  order.orderStatus = 'Cancelled';
  await order.save();

  // Re-add order items back to product stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  // Trigger cancellation notification & email
  await sendNotificationAndEmail({
    user: order.user._id,
    email: order.user.email,
    subject: `AuraCart Order #${order._id} Cancellation Confirmation`,
    title: 'Order Cancelled',
    message: `Your order #${order._id} has been successfully cancelled. If you already made a payment, refunds will be processed shortly.`,
    type: 'order_cancelled',
    data: { orderId: order._id },
  });

  res.status(200).json({ message: 'Order cancelled successfully', order });
});
