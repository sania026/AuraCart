import express from 'express';
import {
  addProductReview,
  updateProductReview,
  deleteProductReview,
  getProductReviews,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route to view product reviews
router.get('/product/:productId', getProductReviews);

// Protected routes to modify reviews
router.use(protect);
router.post('/', addProductReview);
router.route('/:id').put(updateProductReview).delete(deleteProductReview);

export default router;
