import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(placeOrder)
  .get(admin, getAllOrders);

router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
