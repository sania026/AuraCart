import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply protect middleware to all cart routes
router.use(protect);

router
  .route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateCartQuantity);

router.delete('/:productId', removeFromCart);
router.post('/clear', clearCart);

export default router;
