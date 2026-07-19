import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  handleRazorpayWebhook,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Razorpay webhook is public because it is called by Razorpay servers directly
router.post('/webhook', handleRazorpayWebhook);

// Protected order payment endpoints
router.use(protect);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.get('/status/:orderId', getPaymentStatus);

export default router;
