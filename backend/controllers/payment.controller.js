import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/order.model.js';

// Initialize Razorpay
// Note: In production, ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }

  const options = {
    amount: Math.round(order.totalPrice * 100), // amount in lowest currency unit (paisa)
    currency: 'INR',
    receipt: `receipt_order_${order._id}`,
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Razorpay order creation failed');
  }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    res.status(400);
    throw new Error('Please provide all signature and order verification parameters');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Generate signature to compare
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_secret';
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isVerified = generatedSignature === razorpay_signature;

  if (isVerified) {
    // Update order status in DB
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'Paid';
    order.transactionId = razorpay_payment_id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and updated successfully',
      order,
    });
  } else {
    order.paymentStatus = 'Failed';
    await order.save();

    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
});

// @desc    Check Payment Status for an Order
// @route   GET /api/payments/status/:orderId
// @access  Private
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view payment status for this order');
  }

  res.status(200).json({
    orderId: order._id,
    isPaid: order.isPaid,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId,
  });
});

// @desc    Razorpay Webhook handler (Stub for background validation without secret keys)
// @route   POST /api/payments/webhook
// @access  Public
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  // Webhook event verification (using signature header validation)
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (webhookSignature === expectedSignature) {
    const event = req.body.event;

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      // In webhook, find the corresponding order using receipt or notes
      const orderReceipt = paymentEntity.order_id;
      // You can find the order by custom transaction identifier and mark it paid
      console.log(`Webhook Received: Payment captured for order receipt ${orderReceipt}`);
    }

    res.status(200).json({ status: 'ok' });
  } else {
    console.warn('Webhook Received: Invalid signature check');
    res.status(400).json({ message: 'Invalid webhook signature' });
  }
});
